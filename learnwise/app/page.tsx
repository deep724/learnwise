import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Target,
  Route,
  ChartNoAxesCombined,
  Check,
  Database,
  ShieldCheck,
} from "lucide-react";
import { useDemo } from "../lib/store";
export default function Welcome() {
  const { state, update } = useDemo();
  const [profile, setProfile] = useState(state.profileId);
  const navigate = useNavigate();
  const enter = (role: "student" | "faculty") => {
    update((s) => ({ ...s, role, profileId: profile, sessionActive: true }));
    navigate(`/${role}/dashboard`);
  };
  return (
    <div className="welcome">
      <header className="welcome-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <BookOpen size={25} />
          </span>
          <span>
            LearnWise<span className="brand-period">.</span>
          </span>
        </Link>
        <span className="university-wordmark">
          <GraduationCap size={21} />
          Silver Oak University <span>STUDENT PROJECT</span>
        </span>
      </header>
      <main className="welcome-main">
        <div className="welcome-copy">
          <span className="welcome-pill">
            <span /> A little clarity. A better learning journey.
          </span>
          <h1>
            Understand what
            <br />
            to <em>learn next.</em>
            <span className="hero-spark">✧</span>
          </h1>
          <p>
            Your personal space to discover learning gaps, find the right
            resources, and turn small steps into real understanding.
          </p>
          <div className="welcome-features">
            <span>
              <Target size={18} />
              Find your starting point
            </span>
            <span>
              <Route size={18} />
              Follow a path that fits
            </span>
            <span>
              <ChartNoAxesCombined size={18} />
              See your progress
            </span>
          </div>
          <div className="entry-box">
            <label htmlFor="demo-profile">MAKE YOURSELF AT HOME</label>
            <select
              id="demo-profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            >
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.classId} · Demo profile
                </option>
              ))}
            </select>
            <div className="entry-actions">
              <button
                className="btn btn-primary"
                onClick={() => enter("student")}
              >
                Explore as Student
                <ArrowRight size={17} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => enter("faculty")}
              >
                <GraduationCap size={18} />
                Explore as Professor
              </button>
            </div>
            <p>
              <ShieldCheck size={14} />
              Demo access only, with synthetic profiles. No authentication or
              real security. Data stays in this browser when storage is
              available.
            </p>
          </div>
        </div>
        <div
          className="welcome-visual"
          aria-label="LearnWise connects assessment, learning, and progress"
        >
          <div className="hero-orbit orbit-a" />
          <div className="hero-orbit orbit-b" />
          <div className="hero-label">
            <span className="spark-square">
              <Sparkles size={19} />
            </span>
            Built around your next breakthrough
          </div>
          <div className="hero-notebook">
            <div className="notebook-top">
              <span className="notebook-icon">
                <Database size={24} />
              </span>
              <span>
                YOUR LEARNING JOURNEY<small>Database Management Systems</small>
              </span>
              <span className="notebook-dots">•••</span>
            </div>
            <h2>
              Big ideas.
              <br />
              One concept at a time.
            </h2>
            <div className="path-illustration">
              {[
                {
                  name: "Discover your starting point",
                  sub: "A short, focused knowledge check",
                  icon: Target,
                },
                {
                  name: "Learn with a little direction",
                  sub: "Resources matched to your topic results",
                  icon: BookOpen,
                },
                {
                  name: "Watch your understanding grow",
                  sub: "Practice, reflect, and try again",
                  icon: ChartNoAxesCombined,
                },
              ].map((s, i) => (
                <div className="path-illustration-step" key={s.name}>
                  <span className={i === 1 ? "active" : ""}>
                    {i === 0 ? <Check size={18} /> : <s.icon size={19} />}
                  </span>
                  <div>
                    <strong>{s.name}</strong>
                    <small>{s.sub}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="notebook-bottom">
              <span className="mini-avatars">
                <i>AS</i>
                <i>RP</i>
                <i>MD</i>
              </span>
              <span>A space for every kind of learner.</span>
            </div>
          </div>
          <div className="hero-float">
            <span>
              <Check size={20} />
            </span>
            <div>
              A little more confident.
              <small>That’s progress worth making.</small>
            </div>
          </div>
          <span className="hero-decor">✳</span>
        </div>
      </main>
      <div className="welcome-subjects">
        <span>START WITH THE FOUNDATIONS</span>
        <strong>
          <Database size={17} />
          DBMS
        </strong>
        <span>SQL Basics</span>
        <i>·</i>
        <span>SQL JOINs</span>
        <i>·</i>
        <span>Normalization</span>
        <i>·</i>
        <span>Subqueries</span>
      </div>
      <footer className="welcome-footer">
        <span>Student project prototype for Silver Oak University.</span>
        <span>Thoughtful learning. One step at a time.</span>
      </footer>
    </div>
  );
}
