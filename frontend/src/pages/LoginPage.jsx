import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthTabs from "@/components/common/AuthTabs";
import AuthInput from "@/components/common/AuthInput";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const nextFieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = "Email is required.";
    if (!password.trim()) nextFieldErrors.password = "Password is required.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      toast.error("Please fill in all required fields.");
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await login({ email, password }, navigate);
      toast.success("Welcome back 👋");
    } catch (apiError) {
      const errorMessage = apiError?.message || "Login failed.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your ServiceMate account.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />
        <AuthInput
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />
        <div className="text-right">
          <Link className="text-xs font-medium text-primary hover:text-accent" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <Button
          className="w-full transform rounded-lg bg-[#F97316] text-white transition duration-300 hover:scale-[1.03] hover:bg-[#EA580C]"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <AuthTabs active="login" />
      <p className="mt-4 text-center text-sm text-slate-500">
        Secure access for users and technicians.
        <Link className="ml-1 text-[#1E3A8A] hover:text-[#F97316]" to="/">
          Back to home
        </Link>
      </p>
    </AuthLayout>
  );
}
