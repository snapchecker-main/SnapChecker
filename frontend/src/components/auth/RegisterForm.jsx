import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { register } from "../../api/services/authApi";
import { handleAuthError } from "../../utils/errorHandler";
import Input from "../common/Input";
import PrimaryButton from "../common/PrimaryButton";

// 🚨 Req #3: Password Strength logic
const getPasswordStrength = (pass) => {
  let score = 0;
  if (!pass) return { label: "", color: "bg-gray-200", w: "w-0" };
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-400", w: "w-1/4" };
  if (score === 3) return { label: "Fair", color: "bg-yellow-400", w: "w-2/4" };
  if (score === 4) return { label: "Good", color: "bg-blue-400", w: "w-3/4" };
  return { label: "Strong", color: "bg-green-500", w: "w-full" };
};

export default function RegisterForm({ setMode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Live Validation States (🚨 Req #2)
  const isNameValid = formData.name.trim().length > 1;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const domain = formData.email.split("@")[1]?.toLowerCase();
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
  ];
  const isProviderValid =
    domain &&
    (allowedDomains.includes(domain) ||
      domain.endsWith(".edu") ||
      domain.endsWith(".edu.ph"));
  const strength = getPasswordStrength(formData.password);
  const isPassValid = formData.password.length >= 8;
  const isConfirmMatch =
    formData.confirm && formData.password === formData.confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (
      !isNameValid ||
      !isEmailValid ||
      !isProviderValid ||
      !isPassValid ||
      !isConfirmMatch
    ) {
      return setApiError("Please fulfill all requirement checks below.");
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.name.trim(),
        school_name: "",
        department: "",
      });
      setMode("verify_success");
    } catch (err) {
      setApiError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {apiError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {apiError}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
          autoFocus
          disabled={isLoading}
          autoComplete="name"
          value={formData.name}
          onChange={(e) => updateForm("name", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <Input
          type="email"
          disabled={isLoading}
          autoComplete="email"
          value={formData.email}
          onChange={(e) => updateForm("email", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            disabled={isLoading}
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => updateForm("password", e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Strength Meter */}
        {formData.password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.color} ${strength.w}`}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 w-12 text-right">
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <Input
          type={showPass ? "text" : "password"}
          disabled={isLoading}
          autoComplete="new-password"
          value={formData.confirm}
          onChange={(e) => updateForm("confirm", e.target.value)}
        />
      </div>

      {/* Live Requirement Checklist */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-1.5 mt-2">
        <ReqItem met={isNameValid} text="Full name provided" />
        <ReqItem met={isProviderValid} text="Standard or .edu email provider" />
        <ReqItem met={isPassValid} text="At least 8 characters long" />
        <ReqItem met={isConfirmMatch} text="Passwords match" />
      </div>

      <PrimaryButton
        type="submit"
        fullWidth
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </PrimaryButton>
    </form>
  );
}

const ReqItem = ({ met, text }) => (
  <div
    className={`flex items-center gap-2 text-xs font-medium transition-colors ${met ? "text-green-600" : "text-gray-400"}`}
  >
    {met ? <Check size={14} /> : <X size={14} />} {text}
  </div>
);
