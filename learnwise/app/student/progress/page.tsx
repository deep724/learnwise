import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react";
import { useDemo } from "../../../lib/store";
import {
  latestResults,
  comparableAttempts,
  statusFor,
} from "../../../lib/quiz";
import { dateLabel } from "../../../lib/utils";
import { topics, topicName } from "../../../data/topics";
import { recommendations } from "../../../lib/recommendations";
import type { Attempt } from "../../../types";
import TopicPerformanceChart from "../../../components/student/TopicPerformanceChart";
import Card from "../../../components/ui/Card";
import Badge, { statusTone } from "../../../components/ui/Badge";
export function AssessmentHistory({ attempts }: { attempts: Attempt[] }) {
  const { state } = useDemo();
  return attempts.length ? (
    <div
      className="table-scroll"
      role="region"
      aria-label="Assessment history, scroll for topic breakdown"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            <th>Assessment</th>
            <th>Date</th>
            <th>Score</th>
            <th>Topic breakdown</th>
          </tr>
        </thead>
        <tbody>
          {[...attempts]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>
                    {a.kind === "diagnostic"
                      ? "DBMS diagnostic"
                      : `${topicName(a.results[0].topic)} practice`}
                  </strong>
                  {state.role === "student" && (
                    <Link
                      className="text-link history-review-link"
                      to={`/student/quiz?attempt=${a.id}`}
                    >
                      View results
                    </Link>
                  )}
                  <small>
                    {a.questions.length} questions
                    {a.synthetic ? " · Synthetic demo" : ""}
                  </small>
                </td>
                <td>{dateLabel(a.date)}</td>
                <td>
                  <Badge tone={statusTone(a.score)}>{a.score}%</Badge>
                </td>
                <td>
                  <div className="history-topics">
                    {a.results.map((r) => (
                      <span key={r.topic}>
                        {topicName(r.topic)} <strong>{r.score}%</strong>{" "}
                        <small>
                          ({r.correct}/{r.total})
                        </small>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="empty-state">
      <ClipboardCheck />
      <h3>Your progress story is waiting.</h3>
      <p>Complete a knowledge check to see your first result here.</p>
      {state.role === "student" && (
        <Link className="text-link" to="/student/quiz">
          Take a knowledge check
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
export function Comparison({ attempts }: { attempts: Attempt[] }) {
  return (
    <div className="comparison-grid">
      {topics.map((t) => {
        const comparable = comparableAttempts(attempts, t.id);
        return (
          <div className="comparison-item" key={t.id}>
            <h3>{t.name}</h3>
            {comparable.length >= 2 ? (
              <>
                <div className="comparison-values">
                  <span>
                    {comparable[0].score}%<small>First</small>
                  </span>
                  <ArrowRight size={18} />
                  <span>
                    {comparable[comparable.length - 1].score}%
                    <small>Latest</small>
                  </span>
                </div>
                <p>
                  {comparable[comparable.length - 1].score -
                    comparable[0].score >=
                  0
                    ? "+"
                    : ""}
                  {comparable[comparable.length - 1].score -
                    comparable[0].score}{" "}
                  percentage points
                </p>
              </>
            ) : (
              <p className="muted">
                Complete {2 - comparable.length} more five-question topic{" "}
                {comparable.length ? "quiz" : "quizzes"} to compare.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default function ProgressPage() {
  const { state } = useDemo();
  const attempts = state.attempts.filter(
    (a) => a.studentId === state.profileId,
  );
  const results = latestResults(state.attempts, state.profileId);
  const studied = state.studied.filter((a) => a.studentId === state.profileId);
  const rec = recommendations(state, state.profileId)[0];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">LOOK HOW FAR YOU’VE COME</div>
          <h1>My Progress</h1>
          <p>
            A thoughtful look at what you’ve studied and what you’ve understood.
          </p>
        </div>
        <Link className="btn btn-primary" to="/student/quiz">
          <TrendingUp size={17} />
          Check my progress
        </Link>
      </div>
      <div className="progress-top">
        <Card>
          <div className="section-heading">
            <div>
              <h2>Your understanding today</h2>
              <p>Latest assessed result for each topic.</p>
            </div>
          </div>
          <TopicPerformanceChart results={results} />
        </Card>
        <Card>
          <h2>Beyond the numbers</h2>
          <p className="muted">
            Activity and understanding are two different parts of your story.
          </p>
          <div className="progress-totals">
            <span>
              <strong>{attempts.length}</strong>Assessments completed
            </span>
            <span>
              <strong>{studied.length}</strong>Resources studied
            </span>
          </div>
          <div className="topic-status-list">
            {topics.map((t) => {
              const r = results.find((r) => r.topic === t.id);
              return (
                <div key={t.id}>
                  <span>{t.name}</span>
                  <Badge tone={statusTone(r?.score)}>
                    {statusFor(r?.score)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <Card className="section-card">
        <div className="section-heading">
          <div>
            <h2>First step to latest step</h2>
            <p>
              Only five-question quizzes on the same topic are compared.
              Different question sets may vary in difficulty.
            </p>
          </div>
        </div>
        <Comparison attempts={attempts} />
      </Card>
      <Card className="section-card">
        <div className="section-heading">
          <div>
            <h2>Your assessment history</h2>
            <p>Every attempt is part of the journey.</p>
          </div>
          <Badge>{attempts.length} attempts</Badge>
        </div>
        <AssessmentHistory attempts={attempts} />
      </Card>
      <div className="progress-bottom">
        <Card>
          <div className="section-heading">
            <h2>Resources you’ve studied</h2>
            <BookOpen size={19} />
          </div>
          {studied.length ? (
            studied.map((a) => {
              const r = state.resources.find((r) => r.id === a.resourceId);
              return (
                <Link
                  key={a.resourceId}
                  className="assignment-row"
                  to={`/student/library/${a.resourceId}`}
                >
                  <span>
                    {r?.title ?? "Historical resource"}
                    <small>
                      {dateLabel(a.date)}
                      {r?.archived ? " · Archived" : ""}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              );
            })
          ) : (
            <p className="muted">
              Your studied resources will appear here. Explore a lesson and mark
              it as studied.
            </p>
          )}
          <p className="small muted">
            Study activity does not establish assessed proficiency.
          </p>
        </Card>
        <Card className="progress-next">
          <span className="eyebrow">KEEP YOUR MOMENTUM</span>
          <h2>{rec.topic.name}: your next small step.</h2>
          <p>{rec.reason}</p>
          <Link className="text-link" to="/student/learning-path">
            Explore your learning path
            <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    </>
  );
}
