import otpGenerator from "otp-generator";
import { env } from "../../config/env.js";
import OTP from "../../models/OTP.js";
import User from "../../models/User.js";
import { sendEmail } from "../../services/email/mailer.js";
import { otpEmailTemplate } from "../../templates/otpEmailTemplate.js";
import { AppError } from "../../utils/AppError.js";
import { generateToken } from "../../utils/jwt.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const allowedSignupRoles = ["user", "technician"];
const RESET_OTP_MAX_ATTEMPTS = 5;

const createOtpCode = () =>
  otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

const buildAuthMeta = (user) => ({
  isVerified: Boolean(user?.isVerified),
  message: user?.isVerified ? "Login successful" : "Please verify OTP first",
});

export const signup = asyncHandler(async (req, res) => {
  const { name, fullName, email, password, role = "user" } = req.body;
  const resolvedFullName = (fullName || name || "").trim();

  console.info("[auth.signup] Incoming request", {
    name,
    fullName,
    email,
    role,
    hasPassword: Boolean(password),
  });

  const missingFields = [];
  if (!resolvedFullName) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");
  if (!role) missingFields.push("role");

  if (missingFields.length > 0) {
    console.warn("[auth.signup] Validation error - missing fields", { missingFields });
    throw new AppError(`All fields required: ${missingFields.join(", ")}`, 400);
  }

  if (!allowedSignupRoles.includes(role)) {
    console.warn("[auth.signup] Validation error - invalid role", { role });
    throw new AppError("Invalid role. Allowed roles: user, technician.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    console.warn("[auth.signup] Duplicate email", { email: normalizedEmail });
    throw new AppError("User already exists", 409);
  }

  try {
    const user = await User.create({
      fullName: resolvedFullName,
      email: normalizedEmail,
      password,
      role,
      isVerified: false,
    });

    const code = createOtpCode();
    const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

    await OTP.deleteMany({
      email: user.email,
      purpose: "email_verification",
      isUsed: false,
    });

    await OTP.create({
      user: user._id,
      email: user.email,
      code,
      purpose: "email_verification",
      expiresAt,
    });

    await sendEmail({
      to: user.email,
      subject: "ServiceMate - Verify your email",
      html: otpEmailTemplate({
        fullName: user.fullName,
        otpCode: code,
        expiryMinutes: env.otpExpiryMinutes,
      }),
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (dbError) {
    console.error("[auth.signup] DB error", {
      message: dbError.message,
      code: dbError.code,
      name: dbError.name,
    });
    if (dbError?.code === 11000) {
      throw new AppError("User already exists", 409);
    }
    throw new AppError(dbError.message || "Unable to create account right now.", 400);
  }
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const otpRecord = await OTP.findOne({
    user: user._id,
    email: user.email,
    code: String(otp).trim(),
    purpose: "email_verification",
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError("Invalid or expired OTP.", 400);
  }

  user.isVerified = true;
  await user.save();

  const authMeta = buildAuthMeta(user);

  await OTP.deleteMany({
    user: user._id,
    email: user.email,
    purpose: "email_verification",
  });

  const token = generateToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: authMeta.isVerified,
      location: user.location || null,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify OTP before login.", 403);
  }

  if (!user.isActive) {
    throw new AppError("Your account is inactive. Please contact support.", 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({ id: user._id, role: user.role });
  const authMeta = buildAuthMeta(user);

  res.status(200).json({
    success: true,
    message: authMeta.message,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: authMeta.isVerified,
      location: user.location || null,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  const authMeta = buildAuthMeta(user);

  res.status(200).json({
    success: true,
    message: "User loaded successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: authMeta.isVerified,
      location: user.location || null,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const code = createOtpCode();
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

  await OTP.deleteMany({
    user: user._id,
    email: user.email,
    purpose: "password_reset",
    isUsed: false,
  });

  await OTP.create({
    user: user._id,
    email: user.email,
    code,
    purpose: "password_reset",
    expiresAt,
  });

  await sendEmail({
    to: user.email,
    subject: "ServiceMate - Password Reset OTP",
    html: otpEmailTemplate({
      fullName: user.fullName,
      otpCode: code,
      expiryMinutes: env.otpExpiryMinutes,
    }),
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const otpRecord = await OTP.findOne({
    user: user._id,
    email: user.email,
    purpose: "password_reset",
    isUsed: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord || otpRecord.expiresAt <= new Date()) {
    throw new AppError("Invalid or expired OTP.", 400);
  }

  if (otpRecord.attempts >= RESET_OTP_MAX_ATTEMPTS) {
    throw new AppError("OTP attempts exceeded. Please request a new OTP.", 429);
  }

  if (String(otpRecord.code) !== String(otp).trim()) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError("Invalid or expired OTP.", 400);
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  res.status(200).json({
    success: true,
    message: "OTP verified",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    throw new AppError("Email, newPassword and confirmPassword are required.", 400);
  }
  if (String(newPassword).length < 6) {
    throw new AppError("Password must be at least 6 characters.", 400);
  }
  if (newPassword !== confirmPassword) {
    throw new AppError("Passwords do not match.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const verifiedOtp = await OTP.findOne({
    user: user._id,
    email: user.email,
    purpose: "password_reset",
    isUsed: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!verifiedOtp) {
    throw new AppError("OTP verification required before resetting password.", 400);
  }

  user.password = newPassword;
  await user.save();

  await OTP.deleteMany({
    user: user._id,
    email: user.email,
    purpose: "password_reset",
  });

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});
