import { thresholds } from "../../lib/quiz";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { FacultyMetrics } from "../../lib/faculty";
import Badge from "../ui/Badge";
export default function StudentPerformanceTable({
  metrics: m,
}: {
  metrics: FacultyMetrics;
}) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label="Student performance, scroll for all columns"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Demo class</th>
            <th>Topics assessed</th>
            <th>Topics below 60%</th>
            <th>Insights</th>
          </tr>
        </thead>
        <tbody>
          {m.rows.map(({ student: s, results }) => (
            <tr key={s.id}>
              <td>
                <Link to={`/faculty/students/${s.id}`}>
                  <strong>{s.name}</strong>
                </Link>
              </td>
              <td>{s.classId}</td>
              <td>
                {results.length} / {m.topicStats.length}
              </td>
              <td>
                {results.length ? (
                  <Badge
                    tone={
                      results.some((r) => r.score < thresholds.support)
                        ? "amber"
                        : "teal"
                    }
                  >
                    {results.filter((r) => r.score < thresholds.support).length}{" "}
                    topics
                  </Badge>
                ) : (
                  <Badge>Not assessed</Badge>
                )}
              </td>
              <td>
                <Link className="text-link" to={`/faculty/students/${s.id}`}>
                  View student
                  <ArrowUpRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
