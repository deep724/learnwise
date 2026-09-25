import type { LucideIcon } from "lucide-react";
import Card from "../ui/Card";
export default function ProgressCard({
  label,
  value,
  suffix,
  detail,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  detail: string;
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <Card className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="stat-value">
        {value}
        <span>{suffix}</span>
      </div>
      <div className="stat-detail">{detail}</div>
    </Card>
  );
}
