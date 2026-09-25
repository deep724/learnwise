import { Link } from "react-router-dom";
import { useDemo } from "../../../lib/store";
import Card from "../../../components/ui/Card";
export default function Assignments() {
  const { state } = useDemo();
  const assignments = state.assignments.filter(
    (a) => a.studentId === state.profileId,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">GUIDANCE FROM YOUR PROFESSOR</div>
          <h1>Assigned resources</h1>
          <p>Resources selected for your learning journey.</p>
        </div>
      </div>
      <Card>
        {assignments.length ? (
          assignments.map((a) => {
            const r = state.resources.find((r) => r.id === a.resourceId);
            const studied = state.studied.some(
              (s) =>
                s.studentId === state.profileId &&
                s.resourceId === a.resourceId,
            );
            return (
              <Link
                className="assignment-row"
                key={a.id}
                to={`/student/library/${a.resourceId}`}
              >
                <span>
                  {r?.title ?? "Resource unavailable"}
                  <small>
                    {r?.archived
                      ? "Archived · Historical access"
                      : "Assigned by Professor"}
                  </small>
                </span>
                <span className="badge badge-teal">
                  {studied ? "Studied" : "Assigned"}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="empty-state">
            <h2>No resources assigned yet</h2>
            <p>Your Professor's suggestions will appear here.</p>
            <Link className="btn btn-primary" to="/student/library">
              Explore the library
            </Link>
          </div>
        )}
      </Card>
    </>
  );
}
