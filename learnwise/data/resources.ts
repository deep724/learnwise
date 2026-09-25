import type { Resource, TopicId } from "../types";
const lessons: Record<
  TopicId,
  { intro: string; example: string; practice: string; takeaways: string[] }
> = {
  basics: {
    intro:
      "SQL is the language we use to ask a relational database questions. A table stores one kind of thing, such as a student. Each row is a record; each column is an attribute. SELECT chooses columns, FROM identifies the table, and WHERE filters individual rows.\n\nStart with a focused question: which students scored at least 60? Select only the columns you need. SQL does not guarantee result order unless you specify ORDER BY.",
    example:
      "SELECT name, score\nFROM students\nWHERE score >= 60\nORDER BY score DESC;",
    practice:
      "Imagine students(id, name, score) contains (1, Aanya, 84), (2, Rohan, 52), and (3, Meera, 76). Write a query that returns names with scores above 75, highest first.\n\nSolution:\n```sql\nSELECT name FROM students\nWHERE score > 75\nORDER BY score DESC;\n```\nThe result is Aanya, then Meera. A WHERE condition is evaluated before sorting.",
    takeaways: [
      "SELECT chooses columns; WHERE filters rows.",
      "Use IS NULL to test for missing values.",
      "ORDER BY is required for a guaranteed sort order.",
    ],
  },
  joins: {
    intro:
      "A JOIN combines related rows from two tables. An INNER JOIN keeps only matching pairs. A LEFT JOIN keeps every row from the left table, even when there is no match on the right. Missing right-hand values become NULL.\n\nSuppose students has Aanya (department 10) and Rohan (department 30). Departments contains only department 10, Computing. An INNER JOIN returns Aanya. A LEFT JOIN returns Aanya and Rohan; Rohan’s department name is NULL.\n\nJoin on meaningful keys. If a key matches several rows, the result contains several pairs. JOIN does not automatically remove duplicates.",
    example:
      "SELECT s.name, d.name AS department\nFROM students AS s\nLEFT JOIN departments AS d\n  ON s.department_id = d.id;",
    practice:
      "Find students who have no matching department. Use a LEFT JOIN and test a non-nullable right-side key.\n\n```sql\nSELECT s.name\nFROM students AS s\nLEFT JOIN departments AS d\n  ON s.department_id = d.id\nWHERE d.id IS NULL;\n```\nThis returns Rohan in our example. Testing d.id is safer than testing a descriptive column that may legitimately be NULL.",
    takeaways: [
      "INNER JOIN returns matching pairs only.",
      "LEFT JOIN preserves all left-side records.",
      "ON defines the relationship; unmatched right-side values are NULL.",
    ],
  },
  normalization: {
    intro:
      "Normalization organizes relational tables to reduce duplication and avoid update, insertion, and deletion anomalies. Start by identifying candidate keys and the functional dependencies implied by the domain.\n\nFirst normal form (1NF) uses single values within each field, with no repeating groups. Second normal form (2NF) additionally removes partial dependencies of non-prime attributes on part of a candidate key. Third normal form (3NF) addresses problematic transitive dependencies. In the common single-key case, a non-key attribute should describe the key, not another non-key attribute.\n\nFor Enrollment(student_id, course_id, student_name, course_title, grade), the key is (student_id, course_id). The student name depends only on student_id and the title only on course_id. Split them into Students, Courses, and Enrollments.",
    example:
      "CREATE TABLE enrollments (\n  student_id INTEGER,\n  course_id INTEGER,\n  grade VARCHAR(2),\n  PRIMARY KEY (student_id, course_id)\n);",
    practice:
      "Consider Employees(employee_id, department_id, department_name). Assume employee_id determines department_id and department_id determines department_name. What goes wrong if a department is renamed in only some employee rows?\n\nAnswer: an update anomaly leaves contradictory names. Create Departments(department_id, department_name) and keep department_id as a foreign key in Employees. Each department name now has a single home.",
    takeaways: [
      "Model dependencies before splitting tables.",
      "2NF removes partial dependencies on composite keys.",
      "Normalization reduces anomalies; it does not promise faster queries.",
    ],
  },
  subqueries: {
    intro:
      "A subquery is a query nested inside another SQL statement. It lets one question use the result of another. A scalar subquery returns one column and at most one row. IN checks membership in a set of values; EXISTS checks whether any row exists.\n\nTo find students scoring above average, first calculate the average, then compare each student’s score with it. The average subquery is independent of the outer row. A correlated subquery, by contrast, refers to the current outer row.\n\nBe careful with NULL and NOT IN: if the returned set contains NULL, the condition may evaluate to unknown. NOT EXISTS is often a clearer way to express “no matching record.”",
    example:
      "SELECT name, score\nFROM students\nWHERE score > (\n  SELECT AVG(score) FROM students\n);",
    practice:
      "Find students with at least one enrollment using EXISTS.\n\n```sql\nSELECT s.name\nFROM students AS s\nWHERE EXISTS (\n  SELECT 1 FROM enrollments AS e\n  WHERE e.student_id = s.id\n);\n```\nThe inner query refers to s.id, so it is correlated. EXISTS returns a truth value and does not duplicate a student with multiple enrollments.",
    takeaways: [
      "A scalar subquery must return at most one row.",
      "IN tests membership; EXISTS tests for matching rows.",
      "Correlated subqueries reference the outer query.",
    ],
  },
};
const titles: Record<TopicId, string[]> = {
  basics: [
    "Your first SQL query",
    "SELECT, filter, and sort",
    "Put SQL Basics into practice",
  ],
  joins: [
    "Making sense of SQL JOINs",
    "INNER JOIN vs. LEFT JOIN",
    "Practice connecting your tables",
  ],
  normalization: [
    "A simpler guide to normalization",
    "From one table to a better schema",
    "Spot and fix database anomalies",
  ],
  subqueries: [
    "Think inside the query",
    "Subqueries, step by step",
    "Practice nested SQL queries",
  ],
};
export const seedResources: Resource[] = (
  Object.keys(lessons) as TopicId[]
).flatMap((topic) =>
  [0, 1, 2].map((i) => ({
    id: `${topic}-${i + 1}`,
    topic,
    title: titles[topic][i],
    description: [
      lessons[topic].intro.split(". ")[0] + ".",
      "Walk through a practical example and understand why it works.",
      "Build confidence with a focused exercise and an explained solution.",
    ][i],
    type: (["Lesson", "Worked example", "Practice exercise"] as const)[i],
    difficulty: i === 2 ? "Intermediate" : "Beginner",
    minutes: [8, 12, 10][i],
    content:
      i === 0
        ? lessons[topic].intro +
          "\n\n```sql\n" +
          lessons[topic].example +
          "\n```"
        : i === 1
          ? lessons[topic].intro +
            "\n\nWorked SQL example\n```sql\n" +
            lessons[topic].example +
            "\n```\n\n" +
            lessons[topic].practice
          : lessons[topic].practice,
    takeaways: lessons[topic].takeaways,
  })),
);
