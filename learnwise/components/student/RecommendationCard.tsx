import { ArrowRight, Clock3, Sparkles, Route, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemo } from "../../lib/store";
import { recommendations } from "../../lib/recommendations";
export default function RecommendationCard() {
  const { state } = useDemo();
  const rec = recommendations(state, state.profileId)[0];
  const hasAssessment = state.attempts.some(
    (a) => a.studentId === state.profileId,
  );
  return (
    <section className="next-step">
      <div className="next-copy">
        <span className="eyebrow">
          <Sparkles size={15} /> YOUR RECOMMENDED NEXT STEP
        </span>
        <h2>
          {hasAssessment
            ? `Let’s make ${rec.topic.name} click.`
            : "A clearer path starts with you."}
        </h2>
        <p>
          {hasAssessment
            ? rec.reason
            : "Take a short knowledge check to discover your strengths and build a learning path that fits you."}
        </p>
        <div className="next-actions">
          <Link
            className="btn btn-primary"
            to={
              hasAssessment && rec.resource
                ? `/student/library/${rec.resource.id}`
                : "/student/quiz"
            }
          >
            {hasAssessment && rec.resource
              ? "Start learning"
              : "Take knowledge check"}
            <ArrowRight size={16} />
          </Link>
          <span>
            <Clock3 size={14} />
            {hasAssessment && rec.resource
              ? `${rec.resource.minutes} min lesson`
              : "12 questions · About 10 min"}
          </span>
        </div>
      </div>
      <div className="learning-illustration" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <span className="float-star star-one">✧</span>
        <span className="float-star star-two">✧</span>
        <div className="illustration-card">
          <span className="illustration-card-icon">
            <Route size={27} />
          </span>
          <div className="illustration-line long" />
          <div className="illustration-line" />
          <div className="illustration-progress">
            <span />
          </div>
          <span className="illustration-check">
            <Check size={21} />
          </span>
        </div>
        <div className="little-book">
          <span />
          <span />
          <span />
        </div>
        <div className="mini-spark">
          <Sparkles size={23} />
        </div>
      </div>
    </section>
  );
}
