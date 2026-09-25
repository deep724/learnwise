import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { useDemo } from "../../../lib/store";
import { classMetrics } from "../../../lib/faculty";
import { topics } from "../../../data/topics";
import ClassOverviewCards from "../../../components/faculty/ClassOverviewCards";
import TopicHeatmap from "../../../components/faculty/TopicHeatmap";
import LearningGapTable from "../../../components/faculty/LearningGapTable";
import StudentPerformanceTable from "../../../components/faculty/StudentPerformanceTable";
import Card from "../../../components/ui/Card";
export default function FacultyDashboard({
  studentsOnly = false,
}: {
  studentsOnly?: boolean;
}) {
  const { state } = useDemo();
  const [classId, setClassId] = useState("all");
  const [topic, setTopic] = useState("all");
  const metrics = classMetrics(state, classId, topic);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-kicker">
            A CLEARER PICTURE. MORE MEANINGFUL SUPPORT.
          </div>
          <h1>{studentsOnly ? "Student Insights" : "Class Overview"}</h1>
          <p>
            {studentsOnly
              ? "Understand individual progress and guide the next step."
              : "See how your class is doing and where a little support can help."}
          </p>
        </div>
        <span className="soft-label">
          <GraduationCap size={18} />
          Professor workspace
        </span>
      </div>
      <div className="faculty-notice">
        <span className="small-icon">
          <Users size={19} />
        </span>
        <p>
          <strong>A demonstration, with real connections.</strong> Student
          profiles and seeded assessments are synthetic. New activity and
          assignments are shared only within this browser.
        </p>
      </div>
      <div className="faculty-filters">
        <label>
          Demo class
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="all">All demo classes</option>
            <option>CE–A</option>
            <option>CE–B</option>
          </select>
        </label>
        <label>
          Topic coverage
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">All DBMS topics</option>
            {topics.map((t) => (
              <option value={t.id} key={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <span>DBMS · Semester 4</span>
      </div>
      <ClassOverviewCards metrics={metrics} />
      {!studentsOnly && (
        <>
          <div className="faculty-overview-grid">
            <Card>
              <div className="section-heading">
                <div>
                  <h2>The class learning map</h2>
                  <p>
                    Latest result per student and topic. Open a cell for student
                    insights.
                  </p>
                </div>
              </div>
              <TopicHeatmap metrics={metrics} />
            </Card>
            <Card>
              <div className="section-heading">
                <div>
                  <h2>Where support can help</h2>
                  <p>Prioritize revision using assessed topic results.</p>
                </div>
              </div>
              <LearningGapTable metrics={metrics} />
            </Card>
          </div>
          <p className="method-note">
            Averages exclude unassessed topics. Topic means use one latest
            result per assessed student. Short assessments are preliminary; the
            60% and 80% thresholds are prototype rules.
          </p>
        </>
      )}
      <Card className="section-card">
        <div className="section-heading">
          <div>
            <h2>Your students, at a glance</h2>
            <p>Connect each learner with their next useful resource.</p>
          </div>
          {!studentsOnly && (
            <Link className="text-link" to="/faculty/students">
              All insights
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
        <StudentPerformanceTable metrics={metrics} />
      </Card>
    </>
  );
}
