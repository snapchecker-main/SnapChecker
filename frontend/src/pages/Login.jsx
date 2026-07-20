import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import { verifyEmail } from "../api/services/authApi";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import SuccessState from "../components/auth/SuccessState";

export default function Login() {
  const [mode, setMode] = useState("signin");
  // Modes: signin, register, forgot_password, reset_password, verify_success, forgot_success, email_verified

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vToken = params.get("verify_token");
    const rToken = params.get("reset_token");

    if (vToken) {
      verifyEmail(vToken)
        .then(() => {
          setMode("email_verified");
          window.history.replaceState({}, document.title, "/");
          // 🚨 Req #12: Auto-switch after 2 seconds
          setTimeout(() => setMode("signin"), 2000);
        })
        .catch(() => {
          toast.error("Invalid or expired verification link.");
          window.history.replaceState({}, document.title, "/");
        });
    } else if (rToken) {
      setMode("reset_password");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <main className="flex min-h-screen bg-gray-50/50 text-gray-900">
      {/* 🚨 Req #5: Added simple keyframe animation for smooth transitions */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide { animation: fadeSlideIn 0.4s ease-out forwards; }
      `}</style>

      {/* Professional Split Layout */}
      <div className="hidden w-5/12 bg-primary md:flex flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-white text-primary">
              <CheckCircle2 size={17} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              SnapChecker
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mt-12">
            Verify everything, <br /> seamlessly.
          </h1>
          <p className="mt-4 text-primary-100/80 text-lg max-w-sm">
            Join the platform built for official university networks and
            standard providers.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-slide">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2.5 md:hidden justify-center">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white">
              <CheckCircle2 size={17} />
            </div>
            <span className="text-[17px] font-bold tracking-tight">
              SnapChecker
            </span>
          </div>

          {/* Navigation Tabs (Only for Signin / Register) */}
          {(mode === "signin" || mode === "register") && (
            <div className="mb-8 flex gap-6 border-b border-gray-100">
              <button
                onClick={() => setMode("signin")}
                className={`pb-3 text-sm font-semibold transition-all ${
                  mode === "signin"
                    ? "border-b-2 border-primary text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("register")}
                className={`pb-3 text-sm font-semibold transition-all ${
                  mode === "register"
                    ? "border-b-2 border-primary text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Dynamic Component Rendering */}
          <div className="animate-fade-slide" key={mode}>
            {mode === "signin" && <LoginForm setMode={setMode} />}
            {mode === "register" && <RegisterForm setMode={setMode} />}
            {mode === "forgot_password" && (
              <ForgotPasswordForm setMode={setMode} />
            )}
            {mode === "reset_password" && (
              <ResetPasswordForm setMode={setMode} />
            )}

            {/* 🚨 Req #12 & #13: Reusable Success States */}
            {mode === "verify_success" && (
              <SuccessState
                title="Check your inbox"
                message="We've sent a verification link. Please check your email to verify your account. If you don't see it, check your spam folder."
                action={() => setMode("signin")}
                actionText="Return to sign in"
              />
            )}
            {mode === "forgot_success" && (
              <SuccessState
                title="Reset link sent"
                message="Check your inbox for a password reset link. It might take a minute to arrive."
                action={() => setMode("signin")}
                actionText="Back to sign in"
              />
            )}
            {mode === "email_verified" && (
              <SuccessState
                icon="success"
                title="Email verified successfully!"
                message="You can now sign in. Redirecting you automatically..."
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
