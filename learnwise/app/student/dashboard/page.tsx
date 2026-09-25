import { thresholds } from "../../../lib/quiz";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCheck,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  Database,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import { useDemo, useStudent } from "../../../lib/store";
import { latestResults } from "../../../lib/quiz";
import { dateLabel, firstName } from "../../../lib/utils";
import { topicName } from "../../../data/topics";
import Card from "../../../components/ui/Card";
import ProgressCard from "../../../components/student/ProgressCard";
import RecommendationCard from "../../../components/student/RecommendationCard";
import ResourceCard from "../../../components/student/ResourceCard";
import TopicPerformanceChart from "../../../components/student/TopicPerformanceChart";
export default function Dashboard() {
  const { state } = useDemo();
  const student = useStudent();
  const results = latestResults(state.attempts, student.id);
  const attempts = state.attempts
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = attempts[0];
  const bookmarks = state.resources.filter(
    (r) => (state.bookmarks[student.id] ?? []).includes(r.id) && !r.archived,
  );
  const studied = state.studied.filter((a) => a.studentId === student.id);
  const activities = [
    ...attempts.map((a) => ({
      id: a.id,
      title:
        a.kind === "diagnostic"
          ? "Completed DBMS knowledge check"
          : `Practiced ${topicName(a.results[0].topic)}`,
      detail: `${a.score}% score${a.synthetic ? " · Demo activity" : ""}`,
      date: a.date,
      type: "quiz",
    })),
    ...studied.map((a) => ({
      id: a.resourceId,
      title: `Studied ${state.resources.find((r) => r.id === a.resourceId)?.title ?? "a resource"}`,
      detail: "Resource marked as studied",
      date: a.date,
      type: "study",
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const assignments = state.assignments.filter(
    (a) => a.studentId === student.id,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">
            A LITTLE LEARNING. A LOT OF POSSIBILITY.
          </div>
          <h1>
            Welcome back, {firstName(student.name)}{" "}
            <span className="wave">✦</span>
          </h1>
          <p>Let’s turn your curiosity into your next breakthrough.</p>
        </div>
        <Link to="/student/quiz" className="btn btn-primary">
          <ClipboardCheck size={17} />
          Take knowledge check
        </Link>
      </div>
      <div className="student-context">
        <span className="subject-icon">
          <Database size={19} />
        </span>
        <strong>Database Management Systems</strong>
        <span className="context-dot">·</span>
        <span>{student.program}</span>
        <span className="context-dot">·</span>
        <span>{student.semester}</span>
        <span className="subject-tag">Your active subject</span>
      </div>
      <div className="stats-grid">
        <ProgressCard
          label="Topics assessed"
          value={results.length}
          suffix="/ 4"
          detail="Your DBMS learning foundation"
          icon={BookOpen}
        />
        <ProgressCard
          label="Topics proficient"
          value={results.filter((r) => r.score >= thresholds.proficient).length}
          suffix="topics"
          detail="At or above the 80% threshold"
          icon={CircleCheck}
          tone="purple"
        />
        <ProgressCard
          label="Need a little practice"
          value={results.filter((r) => r.score < thresholds.proficient).length}
          suffix="topics"
          detail="Small steps. Stronger understanding."
          icon={Target}
          tone="amber"
        />
        <ProgressCard
          label="Latest assessment"
          value={latest ? `${latest.score}%` : "—"}
          detail={
            latest
              ? `${dateLabel(latest.date)} · ${latest.questions.length} questions`
              : "Your first check is a fresh start"
          }
          icon={TrendingUp}
          tone="blue"
        />
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <RecommendationCard />
          <Card className="performance-card">
            <div className="section-heading">
              <div>
                <h2>Your knowledge, at a glance</h2>
                <p>See where you shine and where you can grow.</p>
              </div>
              <Link className="text-link" to="/student/progress">
                View progress
                <ArrowRight size={14} />
              </Link>
            </div>
            <TopicPerformanceChart results={results} />
            <div className="chart-note">
              <span className="info-dot">i</span> A starting point, not a final
              grade. Short assessments are preliminary.
            </div>
          </Card>
        </div>
        <div className="dashboard-aside">
          <Card className="journey-card">
            <div className="section-heading">
              <h2>Your learning journey</h2>
              <span className="small-icon">
                <RouteIcon />
              </span>
            </div>
            <div className="journey-ring">
              <svg viewBox="0 0 140 140" aria-hidden="true">
                <circle
                  cx="70"
                  cy="70"
                  r="57"
                  fill="none"
                  stroke="#edf2ef"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="57"
                  fill="none"
                  stroke="#258c77"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(results.filter((r) => r.score >= thresholds.proficient).length / 4) * 358} 358`}
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div>
                <strong>
                  {
                    results.filter((r) => r.score >= thresholds.proficient)
                      .length
                  }
                  <span>/4</span>
                </strong>
                <small>topics proficient</small>
              </div>
            </div>
            <p>
              Every concept you understand
              <br />
              is a step forward.
            </p>
            <div className="journey-counts">
              <span>
                <strong>{studied.length}</strong>Resources studied
              </span>
              <span>
                <strong>{attempts.length}</strong>Checks completed
              </span>
            </div>
            <Link
              className="btn btn-secondary full-width"
              to="/student/learning-path"
            >
              View my learning path
              <ArrowRight size={15} />
            </Link>
          </Card>
          <Card className="activity-card">
            <div className="section-heading">
              <h2>Recent activity</h2>
              <Clock3 size={17} className="muted" />
            </div>
            {activities.length ? (
              activities.map((a) => (
                <div className="activity" key={a.id}>
                  <span
                    className={`activity-icon ${a.type === "quiz" ? "teal" : "purple"}`}
                  >
                    {a.type === "quiz" ? (
                      <CheckCheck size={15} />
                    ) : (
                      <BookOpen size={15} />
                    )}
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <span>{a.detail}</span>
                    <small>{dateLabel(a.date)}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-copy">
                Your next step starts your story. Try a knowledge check.
              </p>
            )}
          </Card>
        </div>
      </div>
      {assignments.length > 0 && (
        <Card className="assignments-card">
          <div className="section-heading">
            <h2>From your Professor</h2>
            <span className="badge badge-purple">
              {assignments.length} assigned
            </span>
          </div>
          {assignments.map((a) => {
            const r = state.resources.find((r) => r.id === a.resourceId);
            return (
              <Link
                className="assignment-row"
                to={`/student/library/${a.resourceId}`}
                key={a.id}
              >
                <span>
                  {r?.title ?? "Resource unavailable"}
                  <small>
                    Assigned {dateLabel(a.date)}
                    {r?.archived ? " · Archived" : ""}
                  </small>
                </span>
                <ArrowRight size={17} />
              </Link>
            );
          })}
        </Card>
      )}
      <div className="section-heading saved-heading">
        <div>
          <h2>Saved for your next study session</h2>
          <p>A little collection of things worth coming back to.</p>
        </div>
        <Link className="text-link" to="/student/library">
          Explore library
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="saved-grid">
        {bookmarks.length ? (
          bookmarks
            .slice(0, 3)
            .map((r) => <ResourceCard key={r.id} resource={r} compact />)
        ) : (
          <Card className="empty-state">
            <BookOpen />
            <p>Bookmark a resource to keep it close.</p>
            <Link className="text-link" to="/student/library">
              Explore the library →
            </Link>
          </Card>
        )}
        <Link className="discover-card" to="/student/library">
          <span>
            <BookOpen size={25} />
          </span>
          <h3>Your next “aha!” is in here.</h3>
          <p>
            Explore lessons, examples, and practice
            <br />
            for every step of your DBMS journey.
          </p>
          <strong>
            Find something to learn
            <ArrowRight size={15} />
          </strong>
        </Link>
      </div>
      <div className="encouragement">
        <Flame size={17} />
        <span>
          Learning isn’t a race. Keep showing up, one concept at a time.
        </span>
      </div>
    </>
  );
}
function RouteIcon() {
  return <Target size={17} />;
}
