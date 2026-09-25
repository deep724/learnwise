import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUp, BookOpen, MessageCircle, Plus, Sparkles } from "lucide-react";
import {
  suggestedPrompts,
  curatedResponse,
} from "../../../data/assistantResponses";
import { questions } from "../../../data/questions";
import { topicName } from "../../../data/topics";
import { useDemo } from "../../../lib/store";
import type { TopicId } from "../../../types";
import Content from "../../../components/ui/Content";
import Button from "../../../components/ui/Button";
type Message = { role: "user" | "assistant"; text: string };
export default function Assistant() {
  const { state } = useDemo();
  const [params] = useSearchParams();
  const resource = state.resources.find((r) => r.id === params.get("resource"));
  const question = questions.find((q) => q.id === params.get("question"));
  const answer = params.get("answer");
  const answerIndex =
    answer !== null && /^[0-3]$/.test(answer) ? Number(answer) : undefined;
  const [context, setContext] = useState<TopicId | undefined>(
    resource?.topic ?? question?.topic,
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    question
      ? [
          { role: "user", text: `Help me understand: ${question.text}` },
          {
            role: "assistant",
            text: `${answerIndex !== undefined ? `Your answer: ${question.options[answerIndex]}.\n\n` : ""}Correct answer: ${question.options[question.correct]}.\n\n${question.explanation}`,
          },
        ]
      : resource
        ? [
            { role: "user", text: `Explain ${resource.title}` },
            {
              role: "assistant",
              text: curatedResponse("Simpler explanation", resource.topic).text,
            },
          ]
        : [],
  );
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
    });
  }, [messages]);
  const send = (text: string) => {
    if (!text.trim()) return;
    const response = curatedResponse(text, context);
    if (response.topic) setContext(response.topic);
    setMessages((m) => [
      ...m,
      { role: "user", text: text.trim() },
      { role: "assistant", text: response.text },
    ]);
    setInput("");
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">A LITTLE HELP ALONG THE WAY</div>
          <h1>Learning Assistant</h1>
          <p>
            Your companion for clearer concepts and those “now I get it”
            moments.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setMessages([]);
            setContext(undefined);
            setInput("");
          }}
        >
          <Plus size={16} />
          New conversation
        </Button>
      </div>
      <div className="assistant-shell">
        <aside className="assistant-sidebar">
          <span className="large-icon">
            <Sparkles size={25} />
          </span>
          <h2>
            Learning feels better
            <br />
            with a little help.
          </h2>
          <p>Pick a starting point. We’ll take it one concept at a time.</p>
          <span className="eyebrow">TRY ASKING</span>
          {suggestedPrompts.map((p) => (
            <button className="prompt-btn" key={p} onClick={() => send(p)}>
              <MessageCircle size={15} />
              {p}
            </button>
          ))}
          <div className="assistant-note">
            <BookOpen size={17} />
            <p>
              Built for DBMS. Explanations are curated learning content, not
              live AI-generated answers.
            </p>
          </div>
        </aside>
        <section className="chat-panel">
          <div className="chat-topbar">
            <span>
              <span className="assistant-dot" />
              Demo Assistant — curated explanations
            </span>
            {context && (
              <span className="badge badge-neutral">{topicName(context)}</span>
            )}
          </div>
          <div className="chat-messages" aria-live="polite">
            {!messages.length ? (
              <div className="chat-empty">
                <span className="chat-empty-icon">
                  <Sparkles size={34} />
                </span>
                <h2>A good question is a great start.</h2>
                <p>
                  SQL feeling a little tangled?
                  <br />
                  Let’s untangle it together.
                </p>
                <div className="chat-suggestions">
                  {suggestedPrompts.slice(0, 2).map((p) => (
                    <button onClick={() => send(p)} key={p}>
                      {p}
                      <ArrowUp size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div className={`chat-message ${m.role}`} key={i}>
                  <span className="message-avatar">
                    {m.role === "assistant" ? (
                      <Sparkles size={17} />
                    ) : (
                      state.students.find((s) => s.id === state.profileId)
                        ?.initials
                    )}
                  </span>
                  <div>
                    <strong>
                      {m.role === "assistant" ? "LearnWise Assistant" : "You"}
                    </strong>
                    <Content text={m.text} />
                  </div>
                </div>
              ))
            )}
            <div ref={end} />
          </div>
          {messages.length > 0 && context && (
            <div className="followups">
              {[
                "Simpler explanation",
                "Show an example",
                "Give me a practice question",
              ].map((p) => (
                <button onClick={() => send(p)} key={p}>
                  {p}
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              aria-label="Ask about a DBMS concept"
              placeholder="What would you like to understand?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          <p className="chat-disclaimer">
            Curated explanations for four DBMS topics. Always keep your
            curiosity switched on.
          </p>
        </section>
      </div>
    </>
  );
}
