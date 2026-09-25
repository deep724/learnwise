import type { Attempt, Student } from "../types";
import { selectQuestions, analyze } from "../lib/quiz";
export const demoStudents: Student[] = [
  "Aanya Shah",
  "Rohan Patel",
  "Meera Desai",
  "Arjun Joshi",
  "Diya Mehta",
  "Kabir Rao",
  "Isha Trivedi",
  "Dev Shah",
  "Nisha Parmar",
  "Aditya Soni",
  "Kavya Nair",
  "Veer Pandya",
].map((name, i) => ({
  id: `student-${i + 1}`,
  name,
  initials: name
    .split(" ")
    .map((n) => n[0])
    .join(""),
  program: "B.Tech · Computer Engineering",
  semester: "Semester 4",
  classId: i < 8 ? "CE–A" : "CE–B",
}));
export function seedAttempts(): Attempt[] {
  return demoStudents.slice(0, 11).flatMap((student, index) =>
    [0, 1].map((round) => {
      const qs = selectQuestions(undefined, round);
      const counts =
        index === 0
          ? round === 0
            ? [2, 1, 1, 1]
            : [3, 1, 2, 2]
          : [0, 1, 2, 3].map((t) => (index + t + round) % 4);
      const answers: Record<string, number> = {};
      qs.forEach(
        (q, i) =>
          (answers[q.id] =
            i % 3 < counts[Math.floor(i / 3)]
              ? q.correct
              : (q.correct + 1) % 4),
      );
      return {
        id: `seed-${index}-${round}`,
        studentId: student.id,
        date: new Date(
          Date.now() - (round === 0 ? 9 : 2) * 86400000 - index * 3600000,
        ).toISOString(),
        kind: "diagnostic",
        questions: qs.map((q) => q.id),
        answers,
        ...analyze(qs, answers),
        synthetic: true,
      };
    }),
  );
}
