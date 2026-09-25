import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Library, Bookmark, X } from "lucide-react";
import { useDemo } from "../../../lib/store";
import { topics, topicName } from "../../../data/topics";
import ResourceCard from "../../../components/student/ResourceCard";
import Button from "../../../components/ui/Button";
export default function LibraryPage() {
  const { state } = useDemo();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [topic, setTopic] = useState(
    topics.some((t) => t.id === params.get("topic"))
      ? params.get("topic")!
      : "all",
  );
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [time, setTime] = useState("all");
  const [saved, setSaved] = useState(false);
  const resources = state.resources.filter(
    (r) =>
      !r.archived &&
      (!saved || (state.bookmarks[state.profileId] ?? []).includes(r.id)) &&
      (topic === "all" || r.topic === topic) &&
      (type === "all" || r.type === type) &&
      (difficulty === "all" || r.difficulty === difficulty) &&
      (time === "all" || r.minutes <= Number(time)) &&
      `${r.title} ${r.description} ${topicName(r.topic)} ${r.content} ${r.takeaways.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const clear = () => {
    setQuery("");
    setTopic("all");
    setType("all");
    setDifficulty("all");
    setTime("all");
    setSaved(false);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">
            A WORLD OF UNDERSTANDING, WITHIN REACH
          </div>
          <h1>
            Your digital library<span className="title-dot">.</span>
          </h1>
          <p>Good resources. Clear explanations. Your next “aha!” moment.</p>
        </div>
        <span className="soft-label">
          <Library size={17} />
          {state.resources.filter((r) => !r.archived).length} resources to
          explore
        </span>
      </div>
      <div className="library-banner">
        <div>
          <span className="eyebrow">YOUR ACTIVE SUBJECT</span>
          <h2>Database Management Systems</h2>
          <p>Build a strong foundation, one query at a time.</p>
        </div>
        <div className="library-banner-code" aria-hidden="true">
          <span>SELECT</span> understanding
          <br />
          <span>FROM</span> curiosity;
        </div>
      </div>
      <div className="library-toolbar">
        <div className="search-field">
          <Search size={19} />
          <input
            aria-label="Search library"
            placeholder="Search for a topic, concept, or resource..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="icon-btn"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          className={`btn ${saved ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setSaved(!saved)}
          aria-pressed={saved}
        >
          <Bookmark size={16} />
          Bookmarked
        </button>
      </div>
      <div className="filters">
        <span>
          <SlidersHorizontal size={16} />
          Filter by
        </span>
        <label className="sr-only" htmlFor="topic-filter">
          Topic
        </label>
        <select
          id="topic-filter"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="all">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="type-filter">
          Resource type
        </label>
        <select
          id="type-filter"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All resource types</option>
          {["Lesson", "Worked example", "Practice exercise"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="difficulty-filter">
          Difficulty
        </label>
        <select
          id="difficulty-filter"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="all">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
        </select>
        <label className="sr-only" htmlFor="time-filter">
          Study time
        </label>
        <select
          id="time-filter"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          <option value="all">Any study time</option>
          <option value="10">10 min or less</option>
          <option value="15">15 min or less</option>
        </select>
      </div>
      <div className="result-count">
        <strong>{resources.length} resources</strong>
        <span>Made for understanding, not just memorizing.</span>
      </div>
      {resources.length ? (
        <div className="resource-grid">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <Search size={32} />
          <h2>No resources found</h2>
          <p>Try a different phrase or make your filters a little broader.</p>
          <Button variant="secondary" onClick={clear}>
            Clear all filters
          </Button>
        </div>
      )}
      <div className="coming-soon">
        <span>MORE ROOM TO GROW</span>
        <strong>
          Data Structures <small>Coming soon</small>
        </strong>
        <strong>
          Computer Networks <small>Coming soon</small>
        </strong>
      </div>
    </>
  );
}
