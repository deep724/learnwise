import type { Topic } from "../types";
export const topics: Topic[] = [
  { id: "basics", name: "SQL Basics", short: "SQL Basics", color: "#409f8c" },
  {
    id: "joins",
    name: "SQL JOINs",
    short: "SQL JOINs",
    color: "#ddaa61",
    prerequisite: "basics",
  },
  {
    id: "normalization",
    name: "Normalization",
    short: "Normalization",
    color: "#8b80c8",
    prerequisite: "basics",
  },
  {
    id: "subqueries",
    name: "Subqueries",
    short: "Subqueries",
    color: "#6a9fc5",
    prerequisite: "joins",
  },
];
export const topicName = (id: string) =>
  topics.find((t) => t.id === id)?.name ?? id;
