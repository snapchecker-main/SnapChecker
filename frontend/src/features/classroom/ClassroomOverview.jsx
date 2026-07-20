import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClassroomOverview({ classroom }) {
  const navigate = useNavigate();
  const reviewAssessments = classroom.recent_assessments.filter(
    (assessment) => assessment.review > 0,
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1.55fr)_340px]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-white lg:grid-cols-4">
          <StatCard
            title="Students"
            value={classroom.total_students}
            subtitle={`${classroom.total_students} enrolled`}
            color="primary"
          />
          <StatCard
            title="Assessments"
            value={classroom.total_exams}
            subtitle="Created"
            color="neutral"
          />
          <StatCard
            title="Need Review"
            value={classroom.dashboard_stats.total_review_papers}
            subtitle="Papers pending review"
            color="neutral"
          />
          <StatCard
            title="Grade Completion"
            value={`${classroom.dashboard_stats.completion_percentage}%`}
            subtitle={`${classroom.dashboard_stats.completed_assessments} of ${classroom.total_exams} assessments`}
            color="neutral"
          />
        </div>

        <Card padding="none">
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Assessment overview
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Recent assessment activity
              </p>
            </div>
            <button
              onClick={() => navigate(`/classrooms/${classroom.id}/templates`)}
              className="..."
            ></button>
          </div>

          <div className="divide-y divide-gray-100">
            {classroom.recent_assessments.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon=""
                  title="No Assessments"
                  description="Assessments will appear here once you create one."
                />
              </div>
            ) : (
              classroom.recent_assessments.map((assessment) => (
                <button
                  key={assessment.id}
                  onClick={() =>
                    navigate(
                      `/classrooms/${classroom.id}/templates/${assessment.id}`,
                    )
                  }
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {assessment.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {assessment.total_students} students · {assessment.graded}
                      /{assessment.total_students} graded
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {assessment.review > 0 && (
                      <Badge variant="warning">
                        {assessment.review} need review
                      </Badge>
                    )}
                    <ChevronRight size={15} className="text-gray-300" />
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Needs attention
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Assessments requiring manual review
            </p>
          </div>

          {reviewAssessments.length === 0 ? (
            <div className="px-5 py-8">
              <EmptyState
                icon=""
                title="Everything looks good"
                description="No assessments require manual review."
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviewAssessments.map((assessment) => (
                <div key={assessment.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {assessment.review} paper(s) need review
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {assessment.name}
                  </p>
                  <button
                    onClick={() =>
                      navigate(
                        `/classrooms/${classroom.id}/templates/${assessment.id}/gradebook`,
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Review papers
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </aside>
    </div>
  );
}
