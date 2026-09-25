import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Sparkles,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";
import { useDemo } from "../../../../lib/store";
import { topicName } from "../../../../data/topics";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Content from "../../../../components/ui/Content";
export default function ResourcePage() {
  const { resourceId } = useParams();
  const { state, update } = useDemo();
  const professor = state.role === "faculty";
  const library = professor ? "/faculty/resources" : "/student/library";
  const r = state.resources.find((r) => r.id === resourceId);
  if (!r)
    return (
      <div className="empty-state card">
        <BookOpen />
        <h1>Resource not found</h1>
        <p>This resource may no longer be available.</p>
        <Link className="btn btn-primary" to={library}>
          Back to library
        </Link>
      </div>
    );
  const studied = state.studied.some(
    (a) => a.studentId === state.profileId && a.resourceId === r.id,
  );
  return (
    <>
      <Link className="back-link" to={library}>
        <ArrowLeft size={16} />
        Back to library
      </Link>
      <div className="reader-header">
        <div className="inline-badges">
          <Badge tone="teal">{topicName(r.topic)}</Badge>
          <Badge>{r.type}</Badge>
          {r.archived && (
            <Badge tone="amber">Archived · Historical access</Badge>
          )}
        </div>
        <h1>{r.title}</h1>
        <p>{r.description}</p>
        <div className="reader-meta">
          <span>
            <Clock3 size={16} />
            {r.minutes} min read
          </span>
          <span>{r.difficulty}</span>
          <span>LearnWise original resource</span>
        </div>
      </div>
      <div className="reader-grid">
        <Card className="lesson-card">
          <h2>
            {r.type === "Practice exercise"
              ? "Let’s put it into practice"
              : "Let’s make it make sense."}
          </h2>
          <Content text={r.content} />
          {r.topic === "joins" && (
            <div className="example-tables">
              <div>
                <h3>Students</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Aanya</td>
                      <td>10</td>
                    </tr>
                    <tr>
                      <td>Rohan</td>
                      <td>30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3>Departments</h3>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>10</td>
                      <td>Computing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="takeaways">
            <h3>
              <Sparkles size={18} />
              Take these ideas with you
            </h3>
            <ul>
              {r.takeaways.map((t) => (
                <li key={t}>
                  <Check size={15} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <aside>
          {professor ? (
            <Card className="reader-actions">
              <h2>Professor resource preview</h2>
              <p>Review this lesson without changing student activity.</p>
              <Link
                className="btn btn-primary full-width"
                to="/faculty/students"
              >
                Assign to a student
              </Link>
              <Link
                className="btn btn-secondary full-width"
                to="/faculty/resources"
              >
                Manage resources
              </Link>
            </Card>
          ) : (
            <>
              <Card className="reader-actions">
                <span className="small-icon">
                  <BookOpen size={20} />
                </span>
                <h2>Make this step count.</h2>
                <p>
                  Marking a resource as studied tracks activity. A quiz checks
                  understanding.
                </p>
                <Button
                  className="full-width"
                  disabled={studied}
                  onClick={() =>
                    update(
                      (s) => ({
                        ...s,
                        studied: [
                          ...s.studied,
                          {
                            studentId: s.profileId,
                            resourceId: r.id,
                            date: new Date().toISOString(),
                          },
                        ],
                      }),
                      "Resource marked as studied",
                    )
                  }
                >
                  <Check size={16} />
                  {studied ? "Marked as studied" : "Mark as studied"}
                </Button>
                <Link
                  className="btn btn-secondary full-width"
                  to={`/student/assistant?resource=${r.id}`}
                >
                  <Sparkles size={16} />
                  Explain this concept
                </Link>
                <Link
                  className="btn btn-secondary full-width"
                  to={`/student/quiz?topic=${r.topic}`}
                >
                  <ClipboardCheck size={16} />
                  Take topic quiz
                </Link>
              </Card>
              <div className="reader-tip">
                <span className="eyebrow">A SMALL STUDY TIP</span>
                <p>
                  Try explaining this concept in your own words. The simplest
                  explanation often shows the deepest understanding.
                </p>
                <Link className="text-link" to="/student/learning-path">
                  Your learning path
                  <ArrowRight size={15} />
                </Link>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
