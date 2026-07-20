import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../api/services/authApi";
import { handleAuthError } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import Input from "../common/Input";
import PrimaryButton from "../common/PrimaryButton";

export default function ResetPasswordForm({ setMode }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    const params = new URLSearchParams(window.location.search);
    const rToken = params.get("reset_token");

    setIsLoading(true);
    setError("");
    try {
      await resetPassword(rToken, password);
      toast.success("Password reset successfully!");
      setMode("signin");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Create New Password
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Please enter your new password below.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="relative">
          <Input
            autoFocus
            type={showPass ? "text" : "password"}
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <Input
          type={showPass ? "text" : "password"}
          disabled={isLoading}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <PrimaryButton type="submit" fullWidth disabled={isLoading}>
        {isLoading ? "Saving..." : "Save New Password"}
      </PrimaryButton>
    </form>
  );
}
