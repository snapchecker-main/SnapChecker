import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, me } from "../../api/services/authApi";
import useAuthStore from "../../store/useAuthStore";
import { handleAuthError } from "../../utils/errorHandler";
import Input from "../common/Input";
import PrimaryButton from "../common/PrimaryButton";

export default function LoginForm({ setMode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setIsLoading(true);
    try {
      const token = await login(trimmedEmail, password);
      setAccessToken(token.access_token);
      const user = await me();
      setUser(user);
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          autoFocus
          type="email"
          autoComplete="email"
          value={email}
          disabled={isLoading}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            disabled={isLoading}
            className="pr-10"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPass ? "Hide password" : "Show password"}
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            defaultChecked
            className="accent-primary h-4 w-4 rounded border-gray-300"
          />
          Keep me signed in
        </label>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setMode("forgot_password")}
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <PrimaryButton
        type="submit"
        fullWidth
        disabled={isLoading}
        className="mt-2"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </PrimaryButton>
    </form>
  );
}
