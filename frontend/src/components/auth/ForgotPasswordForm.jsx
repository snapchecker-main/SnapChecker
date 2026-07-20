import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { forgotPassword } from "../../api/services/authApi";
import { handleAuthError } from "../../utils/errorHandler";
import Input from "../common/Input";
import PrimaryButton from "../common/PrimaryButton";

export default function ForgotPasswordForm({ setMode }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return setError("Please enter your email.");

    setIsLoading(true);
    setError("");
    try {
      await forgotPassword(trimmed);
      setMode("forgot_success"); // 🚨 Req #13
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and we'll send you a link to securely reset your
          password.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <Input
          autoFocus
          type="email"
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <PrimaryButton type="submit" fullWidth disabled={isLoading}>
        {isLoading ? "Sending link..." : "Send Reset Link"}
      </PrimaryButton>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => setMode("signin")}
        className="mx-auto flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mt-4"
      >
        <ArrowLeft size={16} /> Back to login
      </button>
    </form>
  );
}
