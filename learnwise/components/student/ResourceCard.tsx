import {
  BookOpen,
  Bookmark,
  Clock3,
  ArrowUpRight,
  Code2,
  PencilLine,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Resource } from "../../types";
import { topicName } from "../../data/topics";
import { useDemo } from "../../lib/store";
import Badge from "../ui/Badge";
export default function ResourceCard({
  resource: r,
  compact = false,
}: {
  resource: Resource;
  compact?: boolean;
}) {
  const { state, update } = useDemo();
  const saved = (state.bookmarks[state.profileId] ?? []).includes(r.id);
  const studied = state.studied.some(
    (a) => a.studentId === state.profileId && a.resourceId === r.id,
  );
  const Icon =
    r.type === "Lesson"
      ? BookOpen
      : r.type === "Worked example"
        ? Code2
        : PencilLine;
  return (
    <article className={`resource-card ${compact ? "compact" : ""}`}>
      <div className={`resource-art art-${r.topic}`}>
        <div className="resource-art-grid" />
        <Icon size={compact ? 29 : 37} strokeWidth={1.4} />
        <span>{topicName(r.topic)}</span>
        <button
          className={`bookmark-btn ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Remove bookmark from" : "Bookmark"} ${r.title}`}
          onClick={() =>
            update(
              (s) => ({
                ...s,
                bookmarks: {
                  ...s.bookmarks,
                  [s.profileId]: saved
                    ? (s.bookmarks[s.profileId] ?? []).filter(
                        (id) => id !== r.id,
                      )
                    : [...(s.bookmarks[s.profileId] ?? []), r.id],
                },
              }),
              saved ? "Bookmark removed" : "Resource bookmarked",
            )
          }
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="resource-body">
        <div className="resource-meta">
          <span>{r.type}</span>
          <Badge tone={r.difficulty === "Beginner" ? "teal" : "purple"}>
            {r.difficulty}
          </Badge>
        </div>
        <Link className="resource-title" to={`/student/library/${r.id}`}>
          {r.title}
        </Link>
        {!compact && <p>{r.description}</p>}
        <div className="resource-bottom">
          <span>
            <Clock3 size={14} />
            {r.minutes} min{" "}
            {studied && <Check size={15} aria-label="Studied" />}
          </span>
          <Link
            to={`/student/library/${r.id}`}
            aria-label={`Open resource: ${r.title}`}
          >
            {compact ? "Read now" : "Open resource"}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
