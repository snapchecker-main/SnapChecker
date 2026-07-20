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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vToken = params.get("verify_token");
    const rToken = params.get("reset_token");

    if (vToken) {
      verifyEmail(vToken)
        .then(() => {
          setMode("email_verified");
          window.history.replaceState({}, document.title, "/");
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
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide { animation: fadeSlideIn 0.4s ease-out forwards; }
      `}</style>

      {/* 🚨 UPDATED: Reduced width to w-[40%] lg:w-[35%] */}
      <div className="hidden w-[40%] lg:w-[35%] bg-primary md:flex flex-col p-8 lg:p-12 text-white border-r border-primary-dark/20 relative overflow-hidden h-screen sticky top-0">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

        {/* 🚨 UPDATED: Inner wrapper to horizontally center the block while keeping text left-aligned */}
        <div className="relative z-10 w-full max-w-[360px] mx-auto flex flex-col h-full justify-between py-6">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm shadow-sm">
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight">
              SnapChecker
            </span>
          </div>

          {/* Main Content */}
          <div className="mb-4 mt-auto pt-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 mb-4">
              Assessment workspace
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-[1.1] text-white mb-5">
              Grade smarter,
              <br />
              not harder.
            </h1>
            <p className="text-sm text-white/80 leading-relaxed max-w-[340px] mb-8 font-medium">
              Scan, score, and analyze results from one workspace. Built for
              educators who value accuracy over paperwork.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden max-w-[360px] shadow-lg">
              <div className="border-b border-r border-white/10 p-4 hover:bg-white/5 transition-colors">
                <h3 className="font-bold text-white text-[13px] mb-0.5">
                  Scan
                </h3>
                <p className="text-[11px] text-white/70 font-medium">
                  Upload & auto-grade
                </p>
              </div>
              <div className="border-b border-white/10 p-4 hover:bg-white/5 transition-colors">
                <h3 className="font-bold text-white text-[13px] mb-0.5">
                  Track
                </h3>
                <p className="text-[11px] text-white/70 font-medium">
                  Submission status
                </p>
              </div>
              <div className="border-r border-white/10 p-4 hover:bg-white/5 transition-colors">
                <h3 className="font-bold text-white text-[13px] mb-0.5">
                  Analyze
                </h3>
                <p className="text-[11px] text-white/70 font-medium">
                  Per-item breakdown
                </p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                {/* 🚨 UPDATED: Replaced with Optical Mark Recognition to match image_92b046.png */}
                <h3 className="font-bold text-white text-[13px] mb-0.5 leading-tight">
                  Optical Mark
                  <br />
                  Recognition
                </h3>
                <p className="text-[11px] text-white/70 font-medium mt-0.5">
                  Precise and accurate
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-[11px] text-white/60 font-medium tracking-wide">
            © 2026 SnapChecker
          </div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white md:bg-transparent">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 md:rounded-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-gray-100 animate-fade-slide">
          <div className="mb-8 flex items-center gap-2.5 md:hidden justify-center">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white">
              <CheckCircle2 size={17} />
            </div>
            <span className="text-[17px] font-bold tracking-tight">
              SnapChecker
            </span>
          </div>

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

          <div className="animate-fade-slide" key={mode}>
            {mode === "signin" && <LoginForm setMode={setMode} />}
            {mode === "register" && <RegisterForm setMode={setMode} />}
            {mode === "forgot_password" && (
              <ForgotPasswordForm setMode={setMode} />
            )}
            {mode === "reset_password" && (
              <ResetPasswordForm setMode={setMode} />
            )}

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
