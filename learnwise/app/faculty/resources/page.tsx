import { useState } from "react";
import {
  Archive,
  ArrowUpRight,
  Pencil,
  Plus,
  Search,
  Undo2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useDemo } from "../../../lib/store";
import { topics, topicName } from "../../../data/topics";
import { uid } from "../../../lib/utils";
import { resourceErrors } from "../../../lib/resources";
import type { Resource } from "../../../types";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
const blank: Omit<Resource, "id"> = {
  title: "",
  topic: "basics",
  type: "Lesson",
  difficulty: "Beginner",
  minutes: 10,
  description: "",
  content: "",
  takeaways: [],
};
export default function ResourceManagement() {
  const { state, update } = useDemo();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [editing, setEditing] = useState<Resource>();
  const [archive, setArchive] = useState<Resource>();
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Resource, string>>>(
    {},
  );
  const resources = state.resources.filter((r) =>
    `${r.title} ${r.description} ${r.content} ${topicName(r.topic)} ${r.type}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const change = (field: keyof Resource, value: unknown) => {
    setEditing((r) => (r ? { ...r, [field]: value } : undefined));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const fieldProps = (name: keyof Resource) => ({
    "aria-label": (
      {
        title: "Title",
        topic: "Topic",
        type: "Resource type",
        difficulty: "Difficulty",
        minutes: "Study time (minutes)",
        description: "Description",
        content: "Lesson content",
      } as Partial<Record<keyof Resource, string>>
    )[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `error-${name}` : undefined,
  });
  const fieldError = (name: keyof Resource) =>
    errors[name] && (
      <span className="field-error" id={`error-${name}`}>
        {errors[name]}
      </span>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">GIVE GOOD IDEAS A PLACE TO GROW</div>
          <h1>Resource Management</h1>
          <p>
            Create, refine, and organize resources for the next breakthrough.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing({ ...blank, id: uid() });
            setError("");
            setErrors({});
          }}
        >
          <Plus size={17} />
          Add a resource
        </Button>
      </div>
      <div className="info-box">
        <Archive size={19} />
        <p>
          Edits appear in the student library immediately. Archived resources
          leave the catalog and new recommendations; saved history and existing
          assignments remain accessible.
        </p>
      </div>
      <div className="library-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Search managed resources"
            placeholder="Find a resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="muted">{resources.length} resources</span>
      </div>
      <Card>
        <p className="table-hint muted small">
          Scroll the table sideways to reach preview, edit and archive actions.
        </p>
        <div
          className="table-scroll"
          role="region"
          aria-label="Managed resources, scroll for actions"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Topic</th>
                <th>Level / time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.title}</strong>
                    <small>{r.type}</small>
                  </td>
                  <td>{topicName(r.topic)}</td>
                  <td>
                    {r.difficulty}
                    <small>{r.minutes} min</small>
                  </td>
                  <td>
                    <Badge tone={r.archived ? "neutral" : "teal"}>
                      {r.archived ? "Archived" : "Active"}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="icon-btn"
                        to={`/faculty/resources/${r.id}`}
                        aria-label={`Preview ${r.title}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                      <button
                        className="icon-btn"
                        aria-label={`Edit ${r.title}`}
                        onClick={() => {
                          setEditing(structuredClone(r));
                          setError("");
                          setErrors({});
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        aria-label={`${r.archived ? "Restore" : "Archive"} ${r.title}`}
                        onClick={() =>
                          r.archived
                            ? update(
                                (s) => ({
                                  ...s,
                                  resources: s.resources.map((x) =>
                                    x.id === r.id
                                      ? { ...x, archived: false }
                                      : x,
                                  ),
                                }),
                                "Resource restored",
                              )
                            : setArchive(r)
                        }
                      >
                        {r.archived ? (
                          <Undo2 size={16} />
                        ) : (
                          <Archive size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!resources.length && (
          <div className="empty-state">
            <Search />
            <p>No resources match this search.</p>
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        )}
      </Card>
      {editing && (
        <Modal
          title={
            state.resources.some((r) => r.id === editing.id)
              ? "Edit learning resource"
              : "Create a new learning resource"
          }
          onClose={() => setEditing(undefined)}
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const invalid = resourceErrors(editing);
              setErrors(invalid);
              if (Object.keys(invalid).length) {
                setError(Object.values(invalid).join(" "));
                const form = e.currentTarget;
                requestAnimationFrame(() =>
                  form
                    .querySelector<HTMLElement>('[aria-invalid="true"]')
                    ?.focus(),
                );
                return;
              }
              const resource = {
                ...editing,
                title: editing.title.trim(),
                description: editing.description.trim(),
                content: editing.content.trim(),
                takeaways: [
                  ...new Set(
                    editing.takeaways.map((t) => t.trim()).filter(Boolean),
                  ),
                ],
              };
              const saved = update(
                (s) => ({
                  ...s,
                  resources: s.resources.some((r) => r.id === resource.id)
                    ? s.resources.map((r) =>
                        r.id === resource.id ? resource : r,
                      )
                    : [...s.resources, resource],
                }),
                "Resource saved to the library",
              );
              if (saved) setEditing(undefined);
              else
                setError(
                  "This resource is available for this session only. Browser storage failed. Your input is retained here; free browser storage and choose Save resource to retry before refreshing.",
                );
            }}
          >
            <label className="field">
              Title
              <input
                {...fieldProps("title")}
                required
                maxLength={120}
                value={editing.title}
                onChange={(e) => change("title", e.target.value)}
              />
              {fieldError("title")}
            </label>
            <div className="form-grid">
              <label className="field">
                Topic
                <select
                  {...fieldProps("topic")}
                  value={editing.topic}
                  onChange={(e) => change("topic", e.target.value)}
                >
                  {topics.map((t) => (
                    <option value={t.id} key={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {fieldError("topic")}
              </label>
              <label className="field">
                Resource type
                <select
                  {...fieldProps("type")}
                  value={editing.type}
                  onChange={(e) => change("type", e.target.value)}
                >
                  <option>Lesson</option>
                  <option>Worked example</option>
                  <option>Practice exercise</option>
                </select>
                {fieldError("type")}
              </label>
              <label className="field">
                Difficulty
                <select
                  {...fieldProps("difficulty")}
                  value={editing.difficulty}
                  onChange={(e) => change("difficulty", e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                </select>
                {fieldError("difficulty")}
              </label>
              <label className="field">
                Study time (minutes)
                <input
                  {...fieldProps("minutes")}
                  type="number"
                  min={1}
                  max={240}
                  step={1}
                  required
                  value={editing.minutes || ""}
                  onChange={(e) => change("minutes", Number(e.target.value))}
                />
                {fieldError("minutes")}
              </label>
            </div>
            <label className="field">
              Description
              <textarea
                {...fieldProps("description")}
                required
                rows={2}
                maxLength={600}
                value={editing.description}
                onChange={(e) => change("description", e.target.value)}
              />
              {fieldError("description")}
            </label>
            <label className="field">
              Lesson content
              <textarea
                {...fieldProps("content")}
                required
                rows={7}
                value={editing.content}
                onChange={(e) => change("content", e.target.value)}
                placeholder="Use blank lines for paragraphs. Wrap SQL examples in triple backticks."
              />
              {fieldError("content")}
            </label>
            <label className="field">
              Key takeaways (one per line)
              <textarea
                rows={3}
                value={editing.takeaways.join("\n")}
                onChange={(e) =>
                  change("takeaways", e.target.value.split("\n"))
                }
              />
            </label>
            {error && (
              <p className="validation-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </Button>
              <Button type="submit">Save resource</Button>
            </div>
          </form>
        </Modal>
      )}
      {archive && (
        <Modal
          title="Archive this resource?"
          onClose={() => setArchive(undefined)}
        >
          <p>
            <strong>{archive.title}</strong> will leave the library and new
            recommendations. Students can still open it from historical activity
            or an existing assignment.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setArchive(undefined)}>
              Keep resource
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                update(
                  (s) => ({
                    ...s,
                    resources: s.resources.map((r) =>
                      r.id === archive.id ? { ...r, archived: true } : r,
                    ),
                  }),
                  "Resource archived",
                );
                setArchive(undefined);
              }}
            >
              Archive resource
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
