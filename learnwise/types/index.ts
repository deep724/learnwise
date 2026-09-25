export type TopicId = "basics" | "joins" | "normalization" | "subqueries";
export type ResourceType = "Lesson" | "Worked example" | "Practice exercise";
export type Level = "Beginner" | "Intermediate";
export interface Topic {
  id: TopicId;
  name: string;
  short: string;
  color: string;
  prerequisite?: TopicId;
}
export interface Resource {
  id: string;
  title: string;
  description: string;
  topic: TopicId;
  type: ResourceType;
  difficulty: Level;
  minutes: number;
  content: string;
  takeaways: string[];
  archived?: boolean;
}
export interface Question {
  id: string;
  topic: TopicId;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}
export interface TopicResult {
  topic: TopicId;
  correct: number;
  total: number;
  score: number;
}
export interface Attempt {
  id: string;
  studentId: string;
  date: string;
  kind: "diagnostic" | "practice";
  questions: string[];
  answers: Record<string, number>;
  results: TopicResult[];
  score: number;
  synthetic?: boolean;
}
export interface Student {
  id: string;
  name: string;
  initials: string;
  program: string;
  semester: string;
  classId: string;
}
export interface Assignment {
  id: string;
  studentId: string;
  resourceId: string;
  date: string;
}
export interface Activity {
  studentId: string;
  resourceId: string;
  date: string;
}
export interface DemoState {
  version: 1;
  sessionActive: boolean;
  drafts: Record<string, QuizDraft>;
  profileId: string;
  role: "student" | "faculty";
  students: Student[];
  resources: Resource[];
  attempts: Attempt[];
  bookmarks: Record<string, string[]>;
  studied: Activity[];
  assignments: Assignment[];
}
export interface QuizDraft {
  id: string;
  topic?: TopicId;
  questions: string[];
  answers: Record<string, number>;
}
