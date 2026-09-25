import { Users, Target, TrendingUp, ClipboardCheck } from "lucide-react";
import type { FacultyMetrics } from "../../lib/faculty";
import ProgressCard from "../student/ProgressCard";
export default function ClassOverviewCards({
  metrics: m,
}: {
  metrics: FacultyMetrics;
}) {
  return (
    <div className="stats-grid">
      <ProgressCard
        label="Students assessed"
        value={m.assessed}
        suffix={`/ ${m.students.length}`}
        detail="With a result in the selected coverage"
        icon={Users}
      />
      <ProgressCard
        label="Students needing support"
        value={m.needingSupport}
        detail="At least one topic below 60%"
        icon={Target}
        tone="amber"
      />
      <ProgressCard
        label="Average latest topic score"
        value={m.average === undefined ? "—" : `${m.average}%`}
        detail={`Across ${m.assessmentCount} student–topic results`}
        icon={TrendingUp}
        tone="purple"
      />
      <ProgressCard
        label="Topic assessment coverage"
        value={
          m.students.length && m.topicStats.length
            ? `${Math.round((m.assessmentCount / (m.students.length * m.topicStats.length)) * 100)}%`
            : "—"
        }
        detail={`${m.assessmentCount} of ${m.students.length * m.topicStats.length} possible results`}
        icon={ClipboardCheck}
        tone="blue"
      />
    </div>
  );
}
