import { useState } from "react";
import toast from "react-hot-toast";
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

export default function ForgotPasswordPage() {
  const navigate = useNavigateWithLoader();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      toast.error("Email is required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      toast.success("OTP sent to email");
      navigate("/reset-password", {
        replace: true,
        state: { email: email.trim(), maskedEmail: maskEmail(email.trim()), step: "verify-otp" },
      });
    } catch (apiError) {
      const message = apiError?.message || "Failed to send OTP.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset OTP.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <AuthInput
          id="forgot-email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <Button className="w-full" variant="accent" type="submit" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
    </AuthLayout>
  );
}
