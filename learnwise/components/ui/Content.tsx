export default function Content({ text }: { text: string }) {
  return (
    <div className="lesson-content">
      {text
        .split(/(```[\s\S]*?```)/g)
        .filter(Boolean)
        .map((part, i) =>
          part.startsWith("```") ? (
            <pre key={i}>
              <span className="code-label">SQL</span>
              <code>
                {part
                  .replace(/^```\w*\n?/, "")
                  .replace(/```$/, "")
                  .trim()}
              </code>
            </pre>
          ) : (
            part
              .split("\n\n")
              .filter(Boolean)
              .map((p, j) => <p key={`${i}-${j}`}>{p}</p>)
          ),
        )}
    </div>
  );
}
