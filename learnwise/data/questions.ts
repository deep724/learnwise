import type { Question, TopicId } from "../types";
type Entry = [string, string[], number, string];
const bank: Record<TopicId, Entry[]> = {
  basics: [
    [
      "Which clause filters individual rows?",
      ["WHERE", "ORDER BY", "SELECT", "GROUP BY"],
      0,
      "WHERE filters rows before grouping. ORDER BY sorts the result.",
    ],
    [
      "How do you select every column from students?",
      [
        "SELECT students;",
        "SELECT * FROM students;",
        "GET ALL students;",
        "SELECT ALL COLUMNS students;",
      ],
      1,
      "The * wildcard selects all columns from the table named after FROM.",
    ],
    [
      "Which condition correctly checks a missing email?",
      ["email = NULL", "email == NULL", "email IS NULL", "email EMPTY"],
      2,
      "NULL represents an unknown or missing value. Test it with IS NULL, not equality.",
    ],
    [
      "Which clause sorts scores from highest to lowest?",
      [
        "SORT score",
        "ORDER BY score ASC",
        "GROUP BY score DESC",
        "ORDER BY score DESC",
      ],
      3,
      "DESC requests descending order, from highest to lowest.",
    ],
    [
      "Which expression counts every row?",
      ["COUNT(*)", "SUM(*)", "COUNT(NULL)", "TOTAL(*)"],
      0,
      "COUNT(*) counts rows, including rows containing NULL values.",
    ],
    [
      "Which keyword removes duplicate result rows?",
      ["UNIQUE ROWS", "DISTINCT", "SINGLE", "ONLY"],
      1,
      "SELECT DISTINCT removes duplicate combinations of the selected columns.",
    ],
    [
      "Which condition includes 60 but excludes 80?",
      [
        "score > 60 AND score <= 80",
        "score BETWEEN 60 AND 80",
        "score >= 60 AND score < 80",
        "score < 60 OR score >= 80",
      ],
      2,
      "Use >= for the inclusive lower bound and < for the exclusive upper bound.",
    ],
    [
      "What does a primary key identify?",
      [
        "A table name",
        "Only a foreign table",
        "A sort order",
        "Each row uniquely",
      ],
      3,
      "A primary key uniquely identifies a row and cannot contain NULL.",
    ],
  ],
  joins: [
    [
      "What does an INNER JOIN return?",
      [
        "All left rows",
        "Only matching row pairs",
        "All right rows",
        "Every possible row pair",
      ],
      1,
      "INNER JOIN includes only pairs satisfying the ON condition.",
    ],
    [
      "Which join keeps all rows from the left table?",
      ["INNER JOIN", "CROSS JOIN", "LEFT JOIN", "SELF only"],
      2,
      "LEFT JOIN preserves all left rows; unmatched right columns are NULL.",
    ],
    [
      "What fills right-side columns for an unmatched LEFT JOIN row?",
      ["Zero", "An empty string", "The left key", "NULL"],
      3,
      "Missing right-side values are represented by NULL, not zero or an empty string.",
    ],
    [
      "Which clause usually specifies the join relationship?",
      ["ON", "ORDER BY", "LIMIT", "HAVING"],
      0,
      "ON supplies the condition used to match rows across the tables.",
    ],
    [
      "A left row matches three right rows. How many pairs does INNER JOIN produce?",
      ["One", "Three", "Zero", "Two"],
      1,
      "The join produces a row for each matching pair, so one-to-many relationships can repeat left-side values.",
    ],
    [
      "What does a CROSS JOIN produce?",
      [
        "Only matching keys",
        "Only unmatched rows",
        "Every possible pair",
        "Unique left rows",
      ],
      2,
      "CROSS JOIN forms a Cartesian product. Two rows crossed with three rows produce six pairs.",
    ],
    [
      "How do you find left rows with no match on a non-nullable right key?",
      [
        "INNER JOIN and = NULL",
        "CROSS JOIN",
        "LEFT JOIN and right.id = 0",
        "LEFT JOIN and right.id IS NULL",
      ],
      3,
      "After a LEFT JOIN, an unmatched row has NULL for the non-nullable right-side key.",
    ],
    [
      "Why use table aliases in a JOIN?",
      [
        "To qualify columns clearly",
        "To remove duplicates automatically",
        "To create primary keys",
        "To sort results automatically",
      ],
      0,
      "Aliases such as s and d make references concise and distinguish identically named columns.",
    ],
  ],
  normalization: [
    [
      "What is a main purpose of normalization?",
      [
        "Make every query faster",
        "Reduce redundancy and anomalies",
        "Remove all keys",
        "Combine all data into one table",
      ],
      1,
      "Normalization organizes dependencies to reduce duplicate facts and modification anomalies.",
    ],
    [
      "Which design violates first normal form?",
      [
        "One row per student",
        "A primary key",
        "Several phone numbers stored as a list in one field",
        "A foreign key",
      ],
      2,
      "1NF calls for single values in fields and no repeating groups. Model multiple phone numbers as separate related rows.",
    ],
    [
      "What does second normal form remove?",
      [
        "All foreign keys",
        "All text columns",
        "All transitive dependencies",
        "Partial dependencies on a candidate key",
      ],
      3,
      "2NF requires 1NF and removes partial dependencies of non-prime attributes on part of a candidate key.",
    ],
    [
      "A department name repeats in many employee rows. Renaming only some causes what?",
      [
        "An update anomaly",
        "A cross join",
        "A primary key",
        "A scalar subquery",
      ],
      0,
      "An update anomaly occurs when duplicate copies of a fact become inconsistent.",
    ],
    [
      "For Enrollment(student_id, course_id, grade), what is a suitable key if each student enrolls once per course?",
      [
        "grade",
        "(student_id, course_id)",
        "student_id alone",
        "course_id alone",
      ],
      1,
      "The combination identifies the enrollment; either individual ID can occur in multiple enrollments.",
    ],
    [
      "employee_id → department_id → department_name is an example of what?",
      [
        "A cartesian product",
        "A partial key",
        "A transitive dependency",
        "No dependency",
      ],
      2,
      "The department name depends on employee_id through the department_id attribute.",
    ],
    [
      "Where should department_name be stored to avoid repeated department facts?",
      [
        "In every employee name",
        "In a comma-separated field",
        "Nowhere",
        "In a Departments table keyed by department_id",
      ],
      3,
      "A Departments table stores each department fact once and employees refer to it by ID.",
    ],
    [
      "Does normalization guarantee faster queries?",
      [
        "No; performance depends on workload and design",
        "Yes, always",
        "Only without keys",
        "Only with no joins",
      ],
      0,
      "Normalization improves consistency. Query performance depends on indexes, joins, data volume, and workload.",
    ],
  ],
  subqueries: [
    [
      "What is a subquery?",
      [
        "A query nested inside another query",
        "A table alias",
        "A primary key",
        "A database backup",
      ],
      0,
      "A subquery is nested within another SQL statement and provides a value, a set, or an existence test.",
    ],
    [
      "What must a scalar subquery return?",
      [
        "Any number of columns",
        "One column and at most one row",
        "At least two rows",
        "Only text",
      ],
      1,
      "A scalar subquery is used as a single value; multiple rows cause an error. No rows typically yields NULL.",
    ],
    [
      "Which operator tests membership in a set returned by a subquery?",
      ["LIKE", "ORDER BY", "IN", "BETWEEN TABLES"],
      2,
      "IN tests whether the outer value matches a value in the subquery result.",
    ],
    [
      "What makes a subquery correlated?",
      [
        "It always returns NULL",
        "It uses COUNT",
        "It has no WHERE",
        "It references the outer query",
      ],
      3,
      "A correlated subquery refers to a column from an outer query row.",
    ],
    [
      "What does EXISTS test?",
      [
        "Whether a subquery returns any row",
        "Whether values are sorted",
        "Whether all rows are identical",
        "Whether a table is empty only",
      ],
      0,
      "EXISTS is true if at least one row satisfies the subquery. The selected value is not important.",
    ],
    [
      "Which finds students scoring above the overall average?",
      [
        "WHERE score > SUM(score)",
        "WHERE score > (SELECT AVG(score) FROM students)",
        "WHERE AVG(score) > score",
        "WHERE score IN AVG(students)",
      ],
      1,
      "The scalar subquery calculates the average, which is then compared against each outer score.",
    ],
    [
      "What is a risk of NOT IN when the returned set contains NULL?",
      [
        "It sorts incorrectly",
        "It always returns true",
        "The condition can become unknown",
        "It deletes NULL rows",
      ],
      2,
      "NULL introduces unknown comparisons. NOT EXISTS is often clearer for checking that no related row exists.",
    ],
    [
      "With EXISTS, a student has four matching enrollments. How often is that outer student row returned?",
      ["Four times", "Zero times", "Twice", "Once"],
      3,
      "EXISTS is a boolean test on each outer row and does not multiply it by matching inner rows.",
    ],
  ],
};
export const questions: Question[] = (Object.keys(bank) as TopicId[]).flatMap(
  (topic) =>
    bank[topic].map(([text, options, correct, explanation], i) => ({
      id: `${topic}-q${i + 1}`,
      topic,
      text,
      options,
      correct,
      explanation,
    })),
);
