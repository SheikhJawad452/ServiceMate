import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import AuthInput from "@/components/common/AuthInput";
import AuthLayout from "@/components/layout/AuthLayout";
import useNavigateWithLoader from "@/hooks/useNavigateWithLoader";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const maskEmail = (value) => {
  if (!value || !value.includes("@")) return value;
  const [name, domain] = value.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
};

export default function ResetPasswordPage() {
  const navigate = useNavigateWithLoader();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(location.state?.step || "verify-otp");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const maskedEmail = location.state?.maskedEmail || maskEmail(email.trim());

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !otp.trim()) {
      setError("Email and OTP are required.");
      toast.error("Email and OTP are required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/verify-reset-otp", { email: email.trim(), otp: otp.trim() });
      toast.success("OTP verified");
      setStep("new-password");
    } catch (apiError) {
      const message = apiError?.message || "Invalid OTP.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successful");
      navigate("/login", { replace: true });
    } catch (apiError) {
      const message = apiError?.message || "Failed to reset password.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email.trim()) {
      setError("Email is required to resend OTP.");
      toast.error("Email is required to resend OTP.");
      return;
    }
    setResending(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      toast.success("OTP resent");
    } catch (apiError) {
      const message = apiError?.message || "Failed to resend OTP.";
      setError(message);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={step === "verify-otp" ? "Verify Reset OTP" : "Set New Password"}
      subtitle={
        step === "verify-otp"
          ? `Enter OTP sent to ${maskedEmail || "your email"}`
          : "Create a new password for your account."
      }
    >
      {step === "verify-otp" ? (
        <form className="space-y-4" onSubmit={verifyOtp}>
          {!location.state?.email ? (
            <AuthInput
              id="reset-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          ) : null}
          <AuthInput
            id="reset-otp"
            label="OTP"
            placeholder="Enter OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            required
          />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <Button className="w-full" variant="accent" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
          <Button className="w-full" variant="outline" type="button" onClick={resendOtp} disabled={resending}>
            {resending ? "Resending..." : "Resend OTP"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={submitNewPassword}>
          <AuthInput
            id="new-password"
            type="password"
            label="New Password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={6}
            required
          />
          <AuthInput
            id="confirm-password"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
          />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <Button className="w-full" variant="accent" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link className="font-medium text-primary hover:text-accent" to="/login">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
