import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Settings, LogOut } from "lucide-react";
import { logout as logoutApi } from "../../api/services/authApi";
import useAuthStore from "../../store/useAuthStore";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const logoutStore = useAuthStore((state) => state.logout);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      logoutStore();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white"
      >
        <GraduationCap size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50">
            <GraduationCap size={14} /> Profile
          </button>

          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
          >
            <Settings size={14} /> Settings
          </Link>

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
