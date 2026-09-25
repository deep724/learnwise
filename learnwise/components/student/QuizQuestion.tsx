import type { Question } from "../../types";
export default function QuizQuestion({
  question: q,
  value,
  onChange,
  index,
}: {
  question: Question;
  value?: number;
  onChange: (answer: number) => void;
  index: number;
}) {
  return (
    <fieldset className="question-fieldset">
      <legend>
        <span className="question-number">QUESTION {index + 1}</span>
        {q.text}
      </legend>
      <div className="answer-options">
        {q.options.map((option, i) => (
          <label
            key={i}
            className={`answer-option ${value === i ? "selected" : ""}`}
          >
            <input
              type="radio"
              name={q.id}
              value={i}
              checked={value === i}
              onChange={() => onChange(i)}
            />
            <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
            <span>{option}</span>
            <span className="radio-visual" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
