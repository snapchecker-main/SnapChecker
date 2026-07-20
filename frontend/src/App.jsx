import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { refresh, me } from "./api/services/authApi";
import useAuthStore from "./store/useAuthStore";
import useAppStore from "./store/useAppStore";
import { classroomApi } from "./api/services/classroomApi";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Workspace from "./components/layout/Workspace";
import CreateClassroom from "./features/classroom/CreateClassroom";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

function AuthenticatedApp() {
  const logout = useAuthStore((s) => s.logout);

  const {
    classrooms,
    fetchClassrooms,
    addClassroom,
    removeClassroom,
    updateClassroomInStore,
  } = useAppStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [quotaRefreshTrigger, setQuotaRefreshTrigger] = useState(0);
  const triggerQuotaRefresh = () => setQuotaRefreshTrigger((prev) => prev + 1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pathParts = location.pathname.split("/");
  const activeClassroomId =
    pathParts[1] === "classrooms" && pathParts[2] !== "new"
      ? parseInt(pathParts[2])
      : null;
  const activeClassroom =
    classrooms.find((c) => c.id === activeClassroomId) || null;

  const [newClassData, setNewClassData] = useState({
    name: "",
    subject_name: "",
    academic_term: "",
  });

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const data = await classroomApi.create(newClassData);
      addClassroom(data);
      setNewClassData({ name: "", subject_name: "", academic_term: "" });
      toast.success("Classroom created successfully!");
      navigate(`/classrooms/${data.id}`);
    } catch {
      // Error toast handled globally by Axios interceptor.
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (
      !window.confirm(
        "Delete this classroom?\n\nThis will permanently delete all assessments, scans, and students.",
      )
    )
      return;
    try {
      await classroomApi.remove(classroomId);
      removeClassroom(classroomId);
      toast.success("Classroom deleted.");
      if (activeClassroomId === classroomId) {
        navigate("/");
      }
    } catch (err) {}
  };

  const refreshClassroom = async (id = activeClassroomId) => {
    if (!id) return;
    try {
      const data = await classroomApi.getById(id);
      updateClassroomInStore(data);
    } catch {
      // Error toast handled globally by Axios interceptor.
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeClassroomId={activeClassroomId}
        classrooms={classrooms}
        handleDeleteClassroom={handleDeleteClassroom}
        refreshTrigger={quotaRefreshTrigger}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          classroom={activeClassroom}
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  classrooms={classrooms}
                  handleDeleteClassroom={handleDeleteClassroom}
                />
              }
            />
            <Route
              path="/classrooms/new"
              element={
                <CreateClassroom
                  newClassData={newClassData}
                  setNewClassData={setNewClassData}
                  handleCreateClass={handleCreateClass}
                  onCancel={() => navigate("/")}
                />
              }
            />
            <Route
              path="/classrooms/:classroomId/*"
              element={
                <Workspace
                  activeClassroom={activeClassroom}
                  refreshClassroom={refreshClassroom}
                  onQuotaChange={triggerQuotaRefresh}
                />
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await refresh();
        setAccessToken(token.access_token);
        const user = await me();
        setUser(user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [logout, setAccessToken, setUser]);

  if (loading) return <h2>Loading...</h2>;

  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
}
