import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "./asyncHandler.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return req.cookies?.token || null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new AppError("Unauthorized. Token is missing.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new AppError("Unauthorized. Invalid or expired token.", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError("Unauthorized. User not found or inactive.", 401);
  }

  req.user = user;
  next();
});

export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden. Access denied.", 403));
    }
    return next();
  };

export const requireApprovedUser = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("Unauthorized. User not found.", 401);
  }
  if (!req.user.isVerified) {
    throw new AppError("Please verify OTP before accessing this resource.", 403);
  }
  return next();
});
