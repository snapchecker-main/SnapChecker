import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Search, Plus, ChevronRight, Trash2 } from "lucide-react";
import Input from "../components/common/Input";
import PrimaryButton from "../components/common/PrimaryButton";
import Badge from "../components/common/Badge";

export default function Dashboard({ classrooms, handleDeleteClassroom }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const activeClassrooms = classrooms.filter(
    (c) =>
      c.status !== "Archived" &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subject_name?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5 pt-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Academic workspace
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-gray-900">
            Your classrooms
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose a class to manage assessment activity and results.
          </p>
        </div>

        <PrimaryButton onClick={() => navigate("/classrooms/new")}>
          <Plus size={15} /> Add classroom
        </PrimaryButton>
      </div>

      <div className="flex rounded-lg border border-gray-200 bg-white p-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classrooms, codes, or subjects"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {activeClassrooms.map((c) => (
          <article
            key={c.id}
            className="group flex min-h-48 flex-col rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {c.code || "CLASS"}
                </p>
                <h2 className="mt-1 text-base font-semibold text-gray-900">
                  {c.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Active</Badge>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClassroom(c.id);
                  }}
                  className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Delete Classroom"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between px-5 py-4">
              <div className="space-y-1 text-xs text-gray-500">
                <p>
                  {c.academic_term || "Current Term"} · {c.subject_name}
                </p>
                <p>
                  {c.student_count ?? 0} students · {c.assessment_count ?? 0}{" "}
                  assessments
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/classrooms/${c.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open classroom <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {activeClassrooms.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">
              No active classrooms found.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try adjusting your search or create a new classroom.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
