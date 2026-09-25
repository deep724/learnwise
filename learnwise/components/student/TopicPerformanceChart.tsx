import { thresholds } from "../../lib/quiz";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { topics } from "../../data/topics";
import type { TopicResult } from "../../types";
import { statusFor } from "../../lib/quiz";
export default function TopicPerformanceChart({
  results,
}: {
  results: TopicResult[];
}) {
  const data = topics.map((t) => ({
    ...t,
    short: {
      basics: "Basics",
      joins: "JOINs",
      normalization: "Normal.",
      subqueries: "Subqueries",
    }[t.id],
    score: results.find((r) => r.topic === t.id)?.score,
  }));
  return (
    <>
      <div
        className="chart"
        role="img"
        aria-label={data
          .map(
            (d) =>
              `${d.name}: ${d.score === undefined ? "Not assessed" : d.score + "%"}`,
          )
          .join(". ")}
      >
        <ResponsiveContainer width="100%" height={225}>
          <BarChart
            data={data}
            margin={{ top: 12, right: 14, bottom: 0, left: -24 }}
            barSize={38}
          >
            <CartesianGrid
              strokeDasharray="3 4"
              vertical={false}
              stroke="#e8eeed"
            />
            <XAxis
              dataKey="short"
              tick={{ fontSize: 12, fill: "#52656b" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#52656b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f4f7f6" }}
              formatter={(value) => [`${value}%`, "Latest score"]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e4ece9",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={thresholds.proficient}
              stroke="#9eaaa7"
              strokeDasharray="4 4"
            />
            <Bar
              dataKey="score"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-line" />
          80% demo proficiency threshold
        </span>
        <span>Latest result per topic</span>
      </div>
      <div className="chart-summary">
        {data.map((d) => (
          <p key={d.id}>
            {d.name}: {statusFor(d.score)}{" "}
            {d.score !== undefined &&
              `${d.score}% · ${results.find((r) => r.topic === d.id)?.correct}/${results.find((r) => r.topic === d.id)?.total} questions`}
          </p>
        ))}
      </div>
    </>
  );
}
