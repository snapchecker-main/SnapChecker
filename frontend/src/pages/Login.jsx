import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";
import {
  login,
  register,
  me,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../api/services/authApi";
import useAuthStore from "../store/useAuthStore";
import Input from "../components/common/Input";
import PrimaryButton from "../components/common/PrimaryButton";

export default function Login() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [mode, setMode] = useState("signin"); // signin, register, forgot_password, reset_password, verify_success
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset state
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vToken = params.get("verify_token");
    const rToken = params.get("reset_token");

    if (vToken) {
      verifyEmail(vToken)
        .then((res) => {
          toast.success(res.message);
          window.history.replaceState({}, document.title, "/");
          setMode("signin");
        })
        .catch(() => {
          window.history.replaceState({}, document.title, "/");
        });
    } else if (rToken) {
      setResetToken(rToken);
      setMode("reset_password");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await login(email, password);
      setAccessToken(token.access_token);
      const user = await me();
      setUser(user);
    } catch (err) {
      // Error handled by Axios interceptor
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Username is required.");
      return;
    }
    if (!registerEmail.trim()) {
      toast.error("Email is required.");
      return;
    }

    // Gatekeeper logic
    const domain = registerEmail.split("@")[1]?.toLowerCase();
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
    ];
    const isEdu = domain?.endsWith(".edu") || domain?.endsWith(".edu.ph");

    if (!domain || (!allowedDomains.includes(domain) && !isEdu)) {
      toast.error(
        "Registration is restricted to official university emails or standard providers (Gmail, Yahoo, Outlook). Temporary emails are not allowed.",
      );
      return;
    }

    if (!registerPassword) {
      toast.error("Password is required.");
      return;
    }
    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        full_name: fullName,
        school_name: "",
        department: "",
      });
      setMode("verify_success");
      toast.success("Registration successful!");
    } catch (err) {
      // Error handled by Axios interceptor
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email.");
      return;
    }
    try {
      const res = await forgotPassword(forgotEmail);
      toast.success(res.message);
      setMode("signin");
    } catch (err) {
      // Error handled by Axios interceptor
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!registerPassword || registerPassword !== confirmPassword) {
      toast.error("Passwords do not match or are empty.");
      return;
    }
    try {
      const res = await resetPassword(resetToken, registerPassword);
      toast.success(res.message);
      setMode("signin");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch (err) {
      // Error handled by Axios interceptor
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50">
      <div className="hidden w-1 shrink-0 bg-primary md:block" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white">
            <CheckCircle2 size={17} />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-gray-900">
            SnapChecker
          </span>
        </div>

        <div className="w-full max-w-[360px]">
          {(mode === "signin" || mode === "register") && (
            <div className="mb-6 flex border-b border-gray-200">
              <button
                onClick={() => setMode("signin")}
                className={`pb-2.5 pr-6 text-sm font-medium transition-colors ${
                  mode === "signin"
                    ? "border-b-2 border-primary text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                style={mode === "signin" ? { marginBottom: -1 } : undefined}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("register")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  mode === "register"
                    ? "border-b-2 border-primary text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                style={mode === "register" ? { marginBottom: -1 } : undefined}
              >
                Register
              </button>
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Email
                </span>
                <Input
                  type="email"
                  value={email}
                  placeholder="..."
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Password
                </span>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={password}
                    className="pr-10"
                    placeholder="..."
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-primary"
                  />
                  Keep me signed in
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot_password")}
                  className="font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <PrimaryButton type="submit" fullWidth className="mt-1">
                Sign in
              </PrimaryButton>

              <p className="pt-1 text-center text-xs text-gray-400">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-medium text-primary hover:underline"
                >
                  Request access
                </button>
              </p>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Username
                </span>
                <Input
                  placeholder="Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Email
                </span>
                <Input
                  type="email"
                  placeholder="you@gmail.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Password
                </span>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    className="pr-10"
                    placeholder="Min. 8 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Confirm password
                </span>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    className="pr-10"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>

              <PrimaryButton type="submit" fullWidth className="mt-1">
                Create account
              </PrimaryButton>

              <p className="pt-1 text-center text-xs text-gray-400">
                Already have access?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {mode === "forgot_password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="mb-6 text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Reset Password
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your email and we'll send you a link to reset your
                  password. Make sure to check your spam folder if you don't see
                  it in your inbox.
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Email
                </span>
                <Input
                  type="email"
                  value={forgotEmail}
                  placeholder="you@gmail.com"
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </label>

              <PrimaryButton type="submit" fullWidth>
                Send Reset Link
              </PrimaryButton>

              <button
                type="button"
                onClick={() => setMode("signin")}
                className="mx-auto flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 mt-4"
              >
                <ArrowLeft size={14} /> Back to login
              </button>
            </form>
          )}

          {/* 🚨 ADDED: Reset Password Flow */}
          {mode === "reset_password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="mb-6 text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Create New Password
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Please enter your new password below.
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  New Password
                </span>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Confirm Password
                </span>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              <PrimaryButton type="submit" fullWidth>
                Save New Password
              </PrimaryButton>
            </form>
          )}

          {mode === "verify_success" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Mail size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Check your inbox
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                We've sent a verification link. Please check your email to
                verify your account. If you don't see it, check your spam
                folder.
              </p>
              <button
                onClick={() => setMode("signin")}
                className="mt-6 text-sm font-medium text-primary hover:underline"
              >
                Return to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
