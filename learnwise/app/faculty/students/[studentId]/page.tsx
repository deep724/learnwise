import { thresholds } from "../../../../lib/quiz";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Plus, Send } from "lucide-react";
import { useDemo } from "../../../../lib/store";
import { latestResults } from "../../../../lib/quiz";
import { recommendations } from "../../../../lib/recommendations";
import { uid, dateLabel } from "../../../../lib/utils";
import Card from "../../../../components/ui/Card";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import TopicPerformanceChart from "../../../../components/student/TopicPerformanceChart";
import { AssessmentHistory, Comparison } from "../../../student/progress/page";
export default function StudentInsights() {
  const { studentId } = useParams();
  const { state, update, notify } = useDemo();
  const student = state.students.find((s) => s.id === studentId);
  const [assign, setAssign] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const active = state.resources.filter((r) => !r.archived);
  if (!student)
    return (
      <Card className="empty-state">
        <h1>Student not found</h1>
        <Link className="btn btn-primary" to="/faculty/students">
          Back to students
        </Link>
      </Card>
    );
  const attempts = state.attempts.filter((a) => a.studentId === student.id);
  const recs = recommendations(state, student.id).filter(
    (r) => r.result && r.result.score < thresholds.proficient,
  );
  const assignments = state.assignments.filter(
    (a) => a.studentId === student.id,
  );
  return (
    <>
      <Link className="back-link" to="/faculty/students">
        <ArrowLeft size={15} />
        All student insights
      </Link>
      <div className="page-heading">
        <div className="student-profile-heading">
          <span className="avatar large">{student.initials}</span>
          <div>
            <div className="page-kicker">
              INDIVIDUAL LEARNING STORY · SYNTHETIC PROFILE
            </div>
            <h1>{student.name}</h1>
            <p>
              {student.program} · {student.semester} · {student.classId}
            </p>
          </div>
        </div>
        <Button
          disabled={!active.length}
          onClick={() => {
            setResourceId(active[0]?.id ?? "");
            setAssign(true);
          }}
        >
          <Plus size={17} />
          Assign a resource
        </Button>
      </div>
      <div className="progress-top">
        <Card>
          <div className="section-heading">
            <div>
              <h2>Current topic understanding</h2>
              <p>Latest assessed result per topic.</p>
            </div>
          </div>
          <TopicPerformanceChart
            results={latestResults(state.attempts, student.id)}
          />
        </Card>
        <Card>
          <div className="section-heading">
            <h2>Suggested next steps</h2>
            <BookOpen size={19} />
          </div>
          {recs.length ? (
            recs.map((r) => (
              <div className="student-recommendation" key={r.topic.id}>
                <h3>{r.topic.name}</h3>
                <p>{r.reason}</p>
                {r.resource && (
                  <button
                    className="text-link"
                    onClick={() => {
                      setResourceId(r.resource!.id);
                      setAssign(true);
                    }}
                  >
                    Assign {r.resource.title}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="muted">
              {attempts.length
                ? "No assessed topic currently falls below 80%. Encourage continued practice."
                : "No assessment yet. Invite this student to take the diagnostic."}
            </p>
          )}
        </Card>
      </div>
      <Card className="section-card">
        <div className="section-heading">
          <div>
            <h2>Comparable topic practice</h2>
            <p>
              Five-question quizzes on the same topic; scores may vary with
              question difficulty.
            </p>
          </div>
        </div>
        <Comparison attempts={attempts} />
      </Card>
      <Card className="section-card">
        <div className="section-heading">
          <h2>Assessment history</h2>
        </div>
        <AssessmentHistory attempts={attempts} />
      </Card>
      <Card className="section-card">
        <div className="section-heading">
          <div>
            <h2>Assigned resources</h2>
            <p>
              These appear on {student.name.split(" ")[0]}’s dashboard in this
              browser.
            </p>
          </div>
        </div>
        {assignments.length ? (
          assignments.map((a) => (
            <div className="assignment-row" key={a.id}>
              <span>
                {state.resources.find((r) => r.id === a.resourceId)?.title ??
                  "Historical resource"}
                <small>Assigned {dateLabel(a.date)}</small>
              </span>
              <span className="badge badge-teal">
                {state.studied.some(
                  (s) =>
                    s.studentId === student.id && s.resourceId === a.resourceId,
                )
                  ? "Studied"
                  : "Assigned"}
              </span>
            </div>
          ))
        ) : (
          <p className="muted">
            No resources assigned yet. A thoughtful suggestion can go a long
            way.
          </p>
        )}
      </Card>
      {assign && (
        <Modal
          title={`A next step for ${student.name.split(" ")[0]}`}
          onClose={() => setAssign(false)}
        >
          <p className="muted">
            Choose a learning resource. It will appear on this student’s
            dashboard.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!active.some((r) => r.id === resourceId)) {
                notify(
                  "Choose an available resource. The selected resource may have been archived.",
                );
                return;
              }
              const existing = state.assignments.some(
                (a) =>
                  a.studentId === student.id && a.resourceId === resourceId,
              );
              update(
                (s) =>
                  s.assignments.some(
                    (a) =>
                      a.studentId === student.id && a.resourceId === resourceId,
                  )
                    ? s
                    : {
                        ...s,
                        assignments: [
                          ...s.assignments,
                          {
                            id: uid(),
                            studentId: student.id,
                            resourceId,
                            date: new Date().toISOString(),
                          },
                        ],
                      },
                existing
                  ? "This resource is already assigned."
                  : "Resource assigned to " + student.name,
              );
              setAssign(false);
            }}
          >
            <label className="field">
              Learning resource
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                required
              >
                {active.map((r) => (
                  <option value={r.id} key={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setAssign(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Send size={16} />
                Assign resource
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
