import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Trash2,
  LayoutDashboard,
  HelpCircle,
  Settings,
  Database,
} from "lucide-react";
import { getStorageUsage } from "../../api/services/storageApi";

export default function Sidebar({
  sidebarOpen,
  activeClassroomId,
  classrooms,
  handleDeleteClassroom,
  refreshTrigger,
}) {
  const location = useLocation();
  const activeClassrooms = classrooms.filter((c) => c.status !== "Archived");

  const [usage, setUsage] = useState({
    scans: { current: 0, limit: 250, percent_used: 0 },
    records: { current: 0, limit: 2000, percent_used: 0 },
  });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await getStorageUsage();
        setUsage(data);
      } catch {
        // Error toast handled globally by Axios interceptor.
      }
    };
    fetchUsage();
  }, [refreshTrigger]);

  const formatLimit = (num) => (num >= 1000 ? `${num / 1000}k` : num);

  const getNavStyle = ({ isActive }) =>
    `flex h-9 w-full items-center rounded-md text-xs font-medium transition-colors ${
      isActive
        ? "bg-red-50 text-primary"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    } ${sidebarOpen ? "gap-2.5 px-2.5" : "justify-center"}`;

  // Tooltip message for storage maintenance
  const storageTooltipMessage =
    "To stay within storage limits, please regularly delete old image scans. Your grade records use minimal space and can be safely kept.";

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 ${
        sidebarOpen ? "w-56" : "hidden w-16 md:flex"
      }`}
    >
      <div
        className={`flex h-14 items-center border-b border-gray-100 ${
          sidebarOpen ? "px-4" : "justify-center"
        }`}
      >
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-white">
          <CheckCircle2 size={16} />
        </div>
        {sidebarOpen && (
          <span className="ml-2 whitespace-nowrap text-sm font-semibold tracking-[-0.02em] text-gray-900">
            SnapChecker
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1 p-3">
          <NavLink
            to="/"
            className={getNavStyle}
            end
            title={!sidebarOpen ? "Dashboard" : ""}
          >
            <LayoutDashboard size={16} className="shrink-0" />{" "}
            {sidebarOpen && "Dashboard"}
          </NavLink>

          <NavLink
            to="/help"
            className={getNavStyle}
            title={!sidebarOpen ? "Help" : ""}
          >
            <HelpCircle size={16} className="shrink-0" />{" "}
            {sidebarOpen && "Help"}
          </NavLink>

          <NavLink
            to="/settings"
            className={getNavStyle}
            title={!sidebarOpen ? "Settings" : ""}
          >
            <Settings size={16} className="shrink-0" />{" "}
            {sidebarOpen && "Settings"}
          </NavLink>
        </nav>

        {sidebarOpen && (
          <div className="mx-3 mt-1 border-t border-gray-100 pt-4">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Active classes
            </p>
            <div className="mt-2 space-y-0.5 px-1">
              {activeClassrooms.map((cls) => {
                const isActiveClassroom = activeClassroomId === cls.id;

                return (
                  <div
                    key={cls.id}
                    className={`group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors ${
                      isActiveClassroom ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <Link
                      to={`/classrooms/${cls.id}`}
                      className="flex-1 cursor-pointer overflow-hidden"
                    >
                      <p
                        className={`truncate text-xs font-semibold ${
                          isActiveClassroom ? "text-primary" : "text-gray-700"
                        }`}
                      >
                        {cls.name}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-gray-400">
                        {cls.subject_name}
                      </p>
                    </Link>

                    <button
                      className="rounded p-1 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteClassroom(cls.id);
                      }}
                      title="Delete Classroom"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-gray-100 p-3">
        {sidebarOpen ? (
          <div className="space-y-3 cursor-help" title={storageTooltipMessage}>
            <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Storage usage
            </p>
            <div className="space-y-2.5 px-0.5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="whitespace-nowrap text-[11px] text-gray-500">
                    Annotated Scans
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-gray-700">
                    {usage.scans.current}{" "}
                    <span className="font-normal text-gray-400">
                      / {formatLimit(usage.scans.limit)}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${usage.scans.percent_used}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="whitespace-nowrap text-[11px] text-gray-500">
                    Grade Records
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-gray-700">
                    {usage.records.current}{" "}
                    <span className="font-normal text-gray-400">
                      / {formatLimit(usage.records.limit)}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${usage.records.percent_used}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center cursor-help"
            title={`Storage usage:\n${storageTooltipMessage}`}
          >
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gray-50 text-gray-400">
              <Database size={14} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
