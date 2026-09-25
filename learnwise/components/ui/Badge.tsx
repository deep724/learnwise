import { thresholds } from "../../lib/quiz";
export default function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export const statusTone = (score?: number) =>
  score === undefined
    ? "neutral"
    : score < thresholds.support
      ? "amber"
      : score < thresholds.proficient
        ? "purple"
        : "teal";
