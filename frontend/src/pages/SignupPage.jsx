import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthTabs from "@/components/common/AuthTabs";
import AuthInput from "@/components/common/AuthInput";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const nextFieldErrors = {};
    if (!form.fullName.trim()) nextFieldErrors.fullName = "Full name is required.";
    if (!form.email.trim()) nextFieldErrors.email = "Email is required.";
    if (!form.password.trim()) nextFieldErrors.password = "Password is required.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      toast.error("Please fill in all required fields.");
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await signup(
        {
          name: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
        },
        navigate,
      );
      toast.success("OTP sent");
    } catch (apiError) {
      const errorMessage = apiError?.message || "Unable to create account.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join ServiceMate in minutes.">
      <form className="space-y-3" onSubmit={onSubmit}>
        <AuthInput
          id="fullName"
          name="fullName"
          label="Full name"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={onChange}
          error={fieldErrors.fullName}
          className="sm:col-span-2"
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <AuthInput
            id="email"
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            error={fieldErrors.email}
            required
          />
          <AuthInput
            id="password"
            type="password"
            name="password"
            label="Password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={onChange}
            minLength={6}
            error={fieldErrors.password}
            required
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Role</p>
          <div className="flex gap-2">
            <label
              className={`flex cursor-pointer items-center justify-center rounded-full border px-4 py-1.5 text-sm font-medium transition duration-300 ${
                form.role === "user"
                  ? "border-[#F97316] bg-[#F97316]/10 text-[#EA580C]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#F97316]/50"
              }`}
            >
              <input
                checked={form.role === "user"}
                name="role"
                type="radio"
                value="user"
                onChange={onChange}
                className="sr-only"
              />
              User
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center rounded-full border px-4 py-1.5 text-sm font-medium transition duration-300 ${
                form.role === "technician"
                  ? "border-[#F97316] bg-[#F97316]/10 text-[#EA580C]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#F97316]/50"
              }`}
            >
              <input
                checked={form.role === "technician"}
                name="role"
                type="radio"
                value="technician"
                onChange={onChange}
                className="sr-only"
              />
              Technician
            </label>
          </div>
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <Button
          className="mt-1 w-full transform rounded-lg bg-[#F97316] py-2 text-white transition duration-300 hover:scale-[1.03] hover:bg-[#EA580C]"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>
      <AuthTabs active="signup" />
      <p className="mt-4 text-center text-sm text-slate-500">Create your profile and start booking quickly.</p>
    </AuthLayout>
  );
}
