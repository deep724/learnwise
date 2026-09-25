import { thresholds } from "../../../lib/quiz";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Route,
  Sparkles,
} from "lucide-react";
import { useDemo } from "../../../lib/store";
import { recommendations } from "../../../lib/recommendations";
import Badge, { statusTone } from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
export default function LearningPath() {
  const { state } = useDemo();
  const recs = recommendations(state, state.profileId);
  const assessed = state.attempts.some((a) => a.studentId === state.profileId);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">YOUR NEXT STEP, A LITTLE CLEARER</div>
          <h1>Learning Path</h1>
          <p>Built from your topic results. Updated every time you check in.</p>
        </div>
        <Link className="btn btn-secondary" to="/student/quiz">
          Reassess my understanding
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="path-banner">
        <span className="large-icon">
          <Route size={29} />
        </span>
        <div>
          <h2>Understanding builds on understanding.</h2>
          <p>
            SQL Basics <ArrowRight size={13} /> SQL JOINs{" "}
            <ArrowRight size={13} /> Subqueries{" "}
            <span>
              · Normalization follows SQL Basics on a separate branch.
            </span>
          </p>
        </div>
      </div>
      {!assessed && (
        <Card className="empty-state">
          <Sparkles size={30} />
          <h2>Let’s find your starting point.</h2>
          <p>
            No topics assessed yet. Take a diagnostic to personalize these
            steps.
          </p>
          <Link className="btn btn-primary" to="/student/quiz">
            Take the diagnostic
            <ArrowRight size={16} />
          </Link>
        </Card>
      )}
      <div className="learning-path-list">
        {recs.map((r, i) => {
          const studied = state.studied.some(
            (a) =>
              a.studentId === state.profileId &&
              a.resourceId === r.resource?.id,
          );
          return (
            <div className="path-row" key={r.topic.id}>
              <div className="path-step-number">
                {r.result && r.result.score >= thresholds.proficient ? (
                  <Check size={22} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </div>
              <Card className="path-card">
                <div className="section-heading">
                  <div>
                    <div className="inline-badges">
                      <Badge tone={statusTone(r.result?.score)}>
                        {r.status}
                      </Badge>
                      {i === 0 &&
                        assessed &&
                        r.result &&
                        r.result.score < thresholds.proficient && (
                          <span className="recommended-label">
                            <Sparkles size={13} />
                            Start here
                          </span>
                        )}
                    </div>
                    <h2>{r.topic.name}</h2>
                  </div>
                  <strong className="path-score">
                    {r.result ? `${r.result.score}%` : "—"}
                    <small>
                      {r.result
                        ? `${r.result.correct} / ${r.result.total} correct`
                        : "Not assessed"}
                    </small>
                  </strong>
                </div>
                <p>{r.reason}</p>
                {r.resource ? (
                  <div className="path-resource">
                    <span className="small-icon">
                      <BookOpen size={20} />
                    </span>
                    <div>
                      <strong>{r.resource.title}</strong>
                      <span>
                        <Clock3 size={12} />
                        {r.resource.minutes} min · {r.resource.type} ·{" "}
                        {studied
                          ? "Studied · Ready for practice"
                          : "Ready to explore"}
                      </span>
                    </div>
                    <Link
                      className="btn btn-secondary"
                      to={`/student/library/${r.resource.id}`}
                    >
                      {studied ? "Revisit" : "Open resource"}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <p className="info-box">
                    No active resource for this step. You can still practice
                    this topic.
                  </p>
                )}
                <Link
                  className="text-link"
                  to={`/student/quiz?topic=${r.target}`}
                >
                  Practice{" "}
                  {recs.find((t) => t.topic.id === r.target)?.topic.name ??
                    r.topic.name}
                  <ArrowRight size={14} />
                </Link>
              </Card>
            </div>
          );
        })}
      </div>
      <p className="method-note">
        How this works: below 60% → beginner lesson and practice; 60–79% →
        worked example and quiz; 80%+ → explore an eligible next topic. Weak
        assessed prerequisites are reviewed first. Reading a resource never
        changes your assessed proficiency.
      </p>
    </>
  );
}
