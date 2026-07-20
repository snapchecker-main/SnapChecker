import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PrimaryButton from "../components/common/PrimaryButton";
import useAuthStore from "../store/useAuthStore";
import { changePassword } from "../api/services/authApi";

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please complete all password fields.");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    try {
      await changePassword(currentPassword, newPassword);

      toast.success("Password updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Unable to update password.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-8">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-gray-900">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account profile and application preferences.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
          Profile Details
        </h3>

        <div className="space-y-4 max-w-md">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              Full Name
            </span>
            <Input defaultValue={user?.full_name || "Faculty Member"} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              University Email
            </span>
            <Input
              defaultValue={user?.email || "faculty@university.edu"}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </label>
          <div className="pt-2">
            <PrimaryButton>Save Changes</PrimaryButton>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
          Security
        </h3>

        <div className="max-w-md space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              Current Password
            </span>

            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              New Password
            </span>

            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              Confirm New Password
            </span>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <PrimaryButton onClick={handleChangePassword}>
            Update Password
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}
