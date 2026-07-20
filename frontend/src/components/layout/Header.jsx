import { Link, useLocation, useNavigate, matchPath } from "react-router-dom";
import { CheckCircle2, ChevronRight, Menu } from "lucide-react";
import Tabs from "../common/Tabs";
import UserMenu from "../common/UserMenu";

export default function Header({ sidebarOpen, setSidebarOpen, classroom }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isCreatingClass = path === "/classrooms/new";
  const isArchive = path.startsWith("/archive");
  const isSettings = path.startsWith("/settings");

  const classroomMatch = matchPath("/classrooms/:id/*", path);
  const isClassroomView = !!classroomMatch && !isCreatingClass;

  const assessmentMatch = matchPath(
    "/classrooms/:id/templates/:templateId/*",
    path,
  );
  const isBuilderView = path.includes("/builder");
  const isAssessmentView = !!assessmentMatch && !isBuilderView;

  let assessment = null;
  if (isAssessmentView && classroom?.exams) {
    const templateId = assessmentMatch.params.templateId;
    assessment = classroom.exams.find((e) => e.id === parseInt(templateId));
  }

  let activeTab = "overview";
  if (isAssessmentView) {
    if (path.includes("/scanner")) activeTab = "scanner";
    else if (path.includes("/gradebook")) activeTab = "gradebook";
    else if (path.includes("/item-analysis")) activeTab = "item-analysis";
  } else if (isClassroomView) {
    if (path.includes("/templates")) activeTab = "templates";
    else if (path.includes("/roster")) activeTab = "roster";
    else if (path.includes("/gradebook")) activeTab = "semester-gradebook";
  }

  const handleTabChange = (tabId) => {
    if (isAssessmentView) {
      const base = `/classrooms/${classroom.id}/templates/${assessment.id}`;
      if (tabId === "overview") navigate(base);
      else navigate(`${base}/${tabId}`);
    } else if (isClassroomView) {
      const base = `/classrooms/${classroom.id}`;
      if (tabId === "overview") navigate(base);
      else if (tabId === "semester-gradebook") navigate(`${base}/gradebook`);
      else navigate(`${base}/${tabId}`);
    }
  };

  const classroomTabs = [
    { id: "overview", label: "Overview" },
    { id: "templates", label: "Assessments" },
    { id: "roster", label: "Roster" },
    { id: "semester-gradebook", label: "Semester Gradebook" },
  ];

  const assessmentTabs = [
    { id: "overview", label: "Overview" },
    { id: "scanner", label: "Grade Papers" },
    { id: "gradebook", label: "Gradebook" },
    { id: "item-analysis", label: "Item Analysis" },
  ];

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-3 px-4 md:px-5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:block"
        >
          <Menu size={17} />
        </button>

        <Link
          to="/"
          className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white md:hidden"
        >
          <CheckCircle2 size={15} />
        </Link>

        {/* 🚨 FIGMA MATCH: Breadcrumb Typography */}
        <div className="hidden items-center gap-1.5 text-xs text-black-400 sm:flex">
          <Link to="/" className="hover:text-gray-700">
            Dashboard
          </Link>

          {isClassroomView && classroom && (
            <>
              <ChevronRight size={12} />
              <Link
                to={`/classrooms/${classroom.id}`}
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                {classroom.code || classroom.name}
              </Link>

              {isAssessmentView && assessment && (
                <>
                  <ChevronRight size={12} />
                  <span className="max-w-48 truncate font-medium text-primary">
                    {assessment.name}
                  </span>
                </>
              )}

              {isBuilderView && (
                <>
                  <ChevronRight size={12} />
                  <span className="max-w-48 truncate font-medium text-primary">
                    Template Builder
                  </span>
                </>
              )}
            </>
          )}

          {isArchive && (
            <>
              <ChevronRight size={12} />
              <span className="font-medium text-gray-700">Archive</span>
            </>
          )}

          {isSettings && (
            <>
              <ChevronRight size={12} />
              <span className="font-medium text-gray-700">Settings</span>
            </>
          )}
        </div>

        {/* RIGHT SIDE MENU */}
        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
        </div>
      </div>

      {isClassroomView && classroom && !isBuilderView && (
        <div className="px-5 md:px-7">
          <div className="mb-3 pt-4">
            <h1 className="text-base font-semibold text-gray-900">
              {classroom.name}
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {classroom.subject_name} · {classroom.academic_term}
            </p>
          </div>
          <Tabs
            items={isAssessmentView ? assessmentTabs : classroomTabs}
            value={activeTab}
            onChange={handleTabChange}
          />
        </div>
      )}
    </header>
  );
}
