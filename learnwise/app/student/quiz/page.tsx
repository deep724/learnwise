import { thresholds } from "../../../lib/quiz";
import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  Sparkles,
  Target,
  X,
  AlertCircle,
} from "lucide-react";
import { useDemo } from "../../../lib/store";
import { topics, topicName } from "../../../data/topics";
import { questions } from "../../../data/questions";
import {
  createAttempt,
  draftKey,
  recordAttempt,
  unansweredQuestions,
  selectQuestions,
  statusFor,
} from "../../../lib/quiz";
import { uid } from "../../../lib/utils";
import type { Attempt, Question, TopicId } from "../../../types";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge, { statusTone } from "../../../components/ui/Badge";
import QuizQuestion from "../../../components/student/QuizQuestion";
export default function QuizPage() {
  const { state, update } = useDemo();
  const [params, setParams] = useSearchParams();
  const param = params.get("topic");
  const initialTopic = topics.some((t) => t.id === param)
    ? (param as TopicId)
    : undefined;
  const [topic, setTopic] = useState<TopicId | undefined>(initialTopic);
  const [selected, setSelected] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState<Attempt | undefined>(() =>
    state.attempts.find(
      (a) => a.id === params.get("attempt") && a.studentId === state.profileId,
    ),
  );
  const submitted = useRef(false);
  const attemptId = useRef("");
  const key = draftKey(state.profileId, topic);
  const draft = state.drafts[key];
  const otherDrafts = Object.entries(state.drafts).filter(
    ([id]) => id.startsWith(`${state.profileId}:`) && id !== key,
  );
  const saveDraft = (
    qs: Question[],
    values: Record<string, number>,
    draftTopic = topic,
  ) =>
    update((s) => ({
      ...s,
      drafts: {
        ...s.drafts,
        [draftKey(state.profileId, draftTopic)]: {
          id: attemptId.current,
          topic: draftTopic,
          questions: qs.map((q) => q.id),
          answers: values,
        },
      },
    }));
  const resume = (saved = draft) => {
    if (!saved) return;
    attemptId.current = saved.id;
    submitted.current = false;
    setIndex(0);
    setReview(false);
    setWarning("");
    setTopic(saved.topic);
    setSelected(
      saved.questions.map((id) => questions.find((q) => q.id === id)!),
    );
    setAnswers(saved.answers);
  };
  const start = () => {
    const count = state.attempts.filter(
      (a) =>
        a.studentId === state.profileId &&
        (topic
          ? a.kind === "practice" && a.results[0]?.topic === topic
          : a.kind === "diagnostic"),
    ).length;
    const qs = selectQuestions(topic, count);
    attemptId.current = uid();
    submitted.current = false;
    setSelected(qs);
    saveDraft(qs, {});
    setAnswers({});
    setIndex(0);
    setReview(false);
    setResult(undefined);
    setWarning("");
  };
  const submit = () => {
    if (submitted.current || !selected.length) return;
    const missing = unansweredQuestions(selected, answers).length;
    if (missing) {
      setWarning(
        `${missing} question${missing > 1 ? "s are" : " is"} unanswered. Select an answer for every question before submitting.`,
      );
      return;
    }
    submitted.current = true;
    const attempt = createAttempt(
      attemptId.current,
      state.profileId,
      selected,
      answers,
      topic,
    );
    update(
      (s) => recordAttempt(s, attempt),
      "Assessment saved. Your learning path is updated.",
    );
    setResult(attempt);
    setParams({ attempt: attempt.id }, { replace: true });
    window.scrollTo(0, 0);
  };
  if (result)
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="page-kicker">A LITTLE MORE CLARITY</div>
            <h1>Assessment results</h1>
            <p>
              Every answer tells you something useful about what to learn next.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setResult(undefined);
              setSelected([]);
              setParams(
                result.kind === "practice"
                  ? { topic: result.results[0].topic }
                  : {},
                { replace: true },
              );
            }}
          >
            <RotateCcw size={16} />
            Try another quiz
          </Button>
        </div>
        <Card className="quiz-result-hero">
          <div className="result-score">
            {result.score}
            <span>%</span>
          </div>
          <div>
            <Badge tone="teal">ASSESSMENT COMPLETE</Badge>
            <h2>
              {result.kind === "diagnostic"
                ? "DBMS diagnostic"
                : `${topicName(result.results[0].topic)} topic quiz`}
            </h2>
            <p>
              {result.results.reduce((n, r) => n + r.correct, 0)} of{" "}
              {result.questions.length} correct ·{" "}
              {result.kind === "diagnostic"
                ? "Preliminary diagnostic"
                : "Topic practice"}
            </p>
            <div className="inline-actions">
              <Link className="btn btn-primary" to="/student/learning-path">
                See my learning path
                <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-secondary" to="/student/progress">
                View progress
              </Link>
            </div>
          </div>
        </Card>
        <div className="topic-result-grid">
          {topics.map((t) => {
            const r = result.results.find((r) => r.topic === t.id);
            return (
              <Card key={t.id}>
                <h3>{t.name}</h3>
                <strong className="topic-score">
                  {r ? `${r.score}%` : "—"}
                </strong>
                <Badge tone={statusTone(r?.score)}>
                  {statusFor(r?.score)}
                  {r && r.score >= thresholds.proficient
                    ? " in this assessment"
                    : ""}
                </Badge>
                <p>
                  {r
                    ? `${r.correct} of ${r.total} questions correct`
                    : "Not included in this assessment"}
                </p>
                {r && r.score < thresholds.proficient && (
                  <Link
                    className="text-link"
                    to={`/student/library?topic=${t.id}`}
                  >
                    Review learning resources
                    <ArrowRight size={14} />
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
        <p className="method-note">
          These are configurable prototype thresholds, not validated measures of
          ability. Short results are preliminary. Each topic is assessed
          separately.
        </p>
        <div className="section-heading">
          <h2>Understand every answer</h2>
          <span>{result.questions.length} questions reviewed</span>
        </div>
        <div className="answer-review">
          {result.questions.map((id, i) => {
            const q = questions.find((q) => q.id === id)!;
            const correct = result.answers[id] === q.correct;
            return (
              <Card key={id} className="review-card">
                <div className="review-title">
                  <span
                    className={`review-status ${correct ? "correct" : "incorrect"}`}
                  >
                    {correct ? <Check size={17} /> : <X size={17} />}
                  </span>
                  <div>
                    <span className="eyebrow">
                      QUESTION {i + 1} · {topicName(q.topic)}
                    </span>
                    <h3>{q.text}</h3>
                  </div>
                  <Badge tone={correct ? "teal" : "amber"}>
                    {correct ? "Correct" : "Review this"}
                  </Badge>
                </div>
                <p>
                  Your answer: <strong>{q.options[result.answers[id]]}</strong>
                </p>
                {!correct && (
                  <p>
                    Correct answer: <strong>{q.options[q.correct]}</strong>
                  </p>
                )}
                <div className="answer-explanation">{q.explanation}</div>
                <Link
                  className="text-link"
                  to={`/student/assistant?question=${q.id}&answer=${result.answers[id]}`}
                >
                  <Sparkles size={14} />
                  Explain this answer
                </Link>
              </Card>
            );
          })}
        </div>
      </>
    );
  if (params.has("attempt") && !result)
    return (
      <Card className="empty-state">
        <h1>Assessment not found</h1>
        <p>This result is unavailable for the current student profile.</p>
        <Link to="/student/quiz" className="btn btn-primary">
          Start a knowledge check
        </Link>
      </Card>
    );
  if (!selected.length)
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="page-kicker">KNOW YOUR STARTING POINT</div>
            <h1>Knowledge Check</h1>
            <p>Assess your DBMS understanding and choose what to study next.</p>
          </div>
        </div>
        <div className="quiz-intro-grid">
          <Card className="diagnostic-card">
            {draft && (
              <div className="draft-notice">
                <h2>Continue your unfinished assessment</h2>
                <p>
                  {Object.keys(draft.answers).length} of{" "}
                  {draft.questions.length} answered. Your draft belongs only to
                  this profile.
                </p>
                <div className="inline-actions">
                  <Button onClick={() => resume()}>Resume draft</Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      update((s) => {
                        const drafts = { ...s.drafts };
                        delete drafts[key];
                        return { ...s, drafts };
                      }, "Draft discarded")
                    }
                  >
                    Discard draft
                  </Button>
                </div>
              </div>
            )}
            <span className="large-icon">
              <ClipboardCheck size={32} />
            </span>
            <h2>Choose your assessment</h2>
            <p>
              Choose a full DBMS diagnostic or focus on one topic. You’ll get
              explained answers and a learning path based on your results.
            </p>
            <label className="field">
              What would you like to check?
              <select
                value={topic ?? "diagnostic"}
                onChange={(e) =>
                  setTopic(
                    e.target.value === "diagnostic"
                      ? undefined
                      : (e.target.value as TopicId),
                  )
                }
              >
                <option value="diagnostic">Full DBMS diagnostic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · Topic practice
                  </option>
                ))}
              </select>
            </label>
            <div className="quiz-facts">
              <span>
                <ClipboardCheck size={17} />
                {topic ? 5 : 12} questions
              </span>
              <span>
                <Clock3 size={17} />
                {topic ? "5" : "10"} minutes, at your pace
              </span>
              <span>
                <RotateCcw size={17} />
                No time limit
              </span>
            </div>
            <Button onClick={draft ? () => resume() : start}>
              {draft
                ? "Resume selected assessment"
                : topic
                  ? "Start topic quiz"
                  : "Start diagnostic"}
              <ArrowRight size={17} />
            </Button>
            {!!otherDrafts.length && (
              <div className="draft-notice">
                <h3>Other unfinished assessments</h3>
                {otherDrafts.map(([id, saved]) => (
                  <div key={id} className="draft-row">
                    <p>
                      {saved.topic ? topicName(saved.topic) : "DBMS diagnostic"}{" "}
                      · {Object.keys(saved.answers).length}/
                      {saved.questions.length} answered
                    </p>
                    <div className="inline-actions">
                      <Button variant="secondary" onClick={() => resume(saved)}>
                        Resume{" "}
                        {saved.topic ? topicName(saved.topic) : "diagnostic"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          update((s) => {
                            const drafts = { ...s.drafts };
                            delete drafts[id];
                            return { ...s, drafts };
                          }, "Draft discarded")
                        }
                      >
                        Discard{" "}
                        {saved.topic ? topicName(saved.topic) : "diagnostic"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div className="quiz-expect">
            <h2>What happens next?</h2>
            {[
              {
                title: "Take a thoughtful check-in",
                text: "Choose one answer per question. You can review and change answers before submitting.",
              },
              {
                title: "Understand the why",
                text: "Get a clear explanation for every answer, with results broken down by topic.",
              },
              {
                title: "Find your next small step",
                text: "Explore resources and practice matched to your current understanding.",
              },
            ].map((s, i) => (
              <div className="expect-step" key={s.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
            <div className="info-box">
              <Target size={20} />
              <p>
                Below 60%: needs support. 60–79%: developing. 80%+: proficient
                in this assessment. These are demo rules, not academic grades.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">ONE QUESTION AT A TIME</div>
          <h1>{topic ? topicName(topic) : "DBMS knowledge check"}</h1>
          <p>Take your time. This is about understanding where to go next.</p>
        </div>
        <Badge tone="teal">
          {Object.keys(answers).length} of {selected.length} answered
        </Badge>
      </div>
      <div className="quiz-layout">
        <Card className="quiz-workspace">
          <div className="quiz-progress">
            <span>
              {review
                ? "Review your answers"
                : `Question ${index + 1} of ${selected.length}`}
            </span>
            <span>
              {Math.round(
                (Object.keys(answers).length / selected.length) * 100,
              )}
              % answered
            </span>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: `${(Object.keys(answers).length / selected.length) * 100}%`,
              }}
            />
          </div>
          {review ? (
            <form
              className="pre-submit"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <h2>A quick look before you finish.</h2>
              <p>You can change any answer before submitting.</p>
              {selected.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  className="review-answer-row"
                  onClick={() => {
                    setIndex(i);
                    setReview(false);
                    setWarning("");
                  }}
                >
                  <span>
                    {i + 1}. {q.text}
                    <small>
                      {answers[q.id] === undefined
                        ? "Unanswered"
                        : q.options[answers[q.id]]}
                    </small>
                  </span>
                  <span className="text-link">
                    Edit
                    <ArrowRight size={14} />
                  </span>
                </button>
              ))}
              {warning && (
                <p className="validation-error" role="alert">
                  <AlertCircle size={17} />
                  {warning}
                </p>
              )}
              {warning && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIndex(
                      selected.findIndex((q) => answers[q.id] === undefined),
                    );
                    setReview(false);
                    setWarning("");
                  }}
                >
                  Go to first unanswered question
                </Button>
              )}
              <Button type="submit">
                Submit assessment
                <Check size={17} />
              </Button>
            </form>
          ) : (
            <>
              <Badge tone="neutral">{topicName(selected[index].topic)}</Badge>
              <QuizQuestion
                question={selected[index]}
                value={answers[selected[index].id]}
                index={index}
                onChange={(answer) => {
                  const next = { ...answers, [selected[index].id]: answer };
                  setAnswers(next);
                  saveDraft(selected, next);
                }}
              />
              <div className="quiz-nav">
                <Button
                  variant="secondary"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  <ArrowLeft size={16} />
                  Previous question
                </Button>
                <Button
                  onClick={() =>
                    index === selected.length - 1
                      ? setReview(true)
                      : setIndex(index + 1)
                  }
                >
                  {index === selected.length - 1
                    ? "Review answers"
                    : "Next question"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
        </Card>
        <Card className="quiz-navigation">
          <h3>Your questions</h3>
          <p>Jump to any question to review it.</p>
          <div className="question-dots">
            {selected.map((q, i) => (
              <button
                key={q.id}
                onClick={() => {
                  setIndex(i);
                  setReview(false);
                }}
                className={`${answers[q.id] !== undefined ? "answered" : ""} ${i === index && !review ? "current" : ""}`}
                aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ", answered" : ", unanswered"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="full-width"
            onClick={() => setReview(true)}
          >
            Review all answers
          </Button>
          <p className="small muted">
            Answers are saved as a draft for this student. Return here and
            choose Resume draft after navigating away or refreshing.
          </p>
        </Card>
      </div>
    </>
  );
}
