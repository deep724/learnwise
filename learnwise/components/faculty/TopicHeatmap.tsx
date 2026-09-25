import { Link } from "react-router-dom";
import type { FacultyMetrics } from "../../lib/faculty";
import { statusFor } from "../../lib/quiz";
import { statusTone } from "../ui/Badge";
export default function TopicHeatmap({
  metrics: m,
}: {
  metrics: FacultyMetrics;
}) {
  return (
    <>
      <div
        className="table-scroll"
        role="region"
        aria-label="Class learning map, scroll for all topics"
        tabIndex={0}
      >
        <table className="heatmap">
          <thead>
            <tr>
              <th>Student</th>
              {m.topicStats.map((t) => (
                <th key={t.id}>{t.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rows.map(({ student, results }) => (
              <tr key={student.id}>
                <td>
                  <Link to={`/faculty/students/${student.id}`}>
                    <span className="table-avatar">{student.initials}</span>
                    {student.name}
                  </Link>
                </td>
                {m.topicStats.map((t) => {
                  const result = results.find((r) => r.topic === t.id);
                  return (
                    <td key={t.id}>
                      <Link
                        to={`/faculty/students/${student.id}`}
                        className={`heat-cell heat-${statusTone(result?.score)}`}
                        aria-label={`${student.name}, ${t.name}: ${result ? `${result.score}%, ${result.correct} of ${result.total} correct` : "Not assessed"}. ${statusFor(result?.score)}`}
                      >
                        {result ? `${result.score}%` : "Not assessed"}
                        <small>
                          {result
                            ? `${result.correct}/${result.total} correct`
                            : "—"}
                        </small>
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="heat-legend">
        <span>
          <i className="teal" />
          Proficient ≥80%
        </span>
        <span>
          <i className="purple" />
          Developing 60–79%
        </span>
        <span>
          <i className="amber" />
          Needs support &lt;60%
        </span>
        <span>
          <i className="neutral" />
          Not assessed
        </span>
      </div>
    </>
  );
}
