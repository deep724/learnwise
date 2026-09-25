import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { FacultyMetrics } from "../../lib/faculty";
import { useDemo } from "../../lib/store";
export default function LearningGapTable({
  metrics: m,
}: {
  metrics: FacultyMetrics;
}) {
  const { state } = useDemo();
  return (
    <div className="gap-list">
      {[...m.topicStats]
        .sort((a, b) => b.support - a.support)
        .map((t) => {
          const resource = state.resources.find(
            (r) => r.topic === t.id && r.type === "Lesson" && !r.archived,
          );
          return (
            <div className="gap-row" key={t.id}>
              <div className="gap-topic">
                <span style={{ background: t.color }} />
                <strong>{t.name}</strong>
                <span>
                  {t.average === undefined
                    ? "Not assessed"
                    : `${t.average}% average`}
                </span>
              </div>
              <div className="gap-bar">
                <span
                  style={{ width: `${t.average ?? 0}%`, background: t.color }}
                />
              </div>
              <p>
                {t.count} of {m.students.length} assessed · {t.support} need
                support
              </p>
              <div className="gap-action">
                {t.support
                  ? `Plan a short revision lesson for ${t.support} students.`
                  : t.count
                    ? "Encourage a practice check to consolidate understanding."
                    : "Invite students to take a diagnostic."}
                {resource && (
                  <Link
                    to={`/faculty/resources/${resource.id}`}
                    aria-label={`View suggested ${t.name} lesson`}
                  >
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
