import { test, expect } from "@playwright/test";
import { questions } from "../data/questions";
test("complete student and faculty demonstration with persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Understand what/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/welcome-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome back, Aanya/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Take knowledge check", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
    .click();
  await page.getByRole("button", { name: "Review all answers" }).click();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "12 questions are unanswered",
  );
  for (let i = 0; i < 12; i++) {
    await page
      .getByRole("button", { name: new RegExp(`^Question ${i + 1},`) })
      .click();
    const legend = await page.locator("legend").innerText();
    const q = questions.find((q) => legend.includes(q.text))!;
    await page
      .getByRole("radio")
      .nth(q.topic === "joins" ? (q.correct + 1) % 4 : q.correct)
      .check();
  }
  await page.getByRole("button", { name: "Review all answers" }).click();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByText("9 of 12 correct")).toBeVisible();
  await page.getByRole("link", { name: "See my learning path" }).click();
  const joinCard = page.locator(".path-card").filter({
    has: page.getByRole("heading", { name: "SQL JOINs", exact: true }),
  });
  await expect(joinCard).toContainText("0 of 3");
  await joinCard.getByRole("link", { name: "Open resource" }).click();
  await expect(
    page.getByRole("heading", { name: "Making sense of SQL JOINs" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mark as studied", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Marked as studied" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Explain this concept" }).click();
  await expect(
    page.getByText("Demo Assistant — curated explanations"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Show an example", exact: true })
    .click();
  await expect(page.locator("pre").last()).toContainText("LEFT JOIN");
  await page.goto("/student/quiz?topic=joins");
  await page
    .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
    .click();
  for (let i = 0; i < 5; i++) {
    const legend = await page.locator("legend").innerText();
    const q = questions.find((q) => legend.includes(q.text))!;
    await page.getByRole("radio").nth(q.correct).check();
    await page
      .getByRole("button", {
        name: i === 4 ? "Review answers" : "Next question",
        exact: true,
      })
      .click();
  }
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
  await page.getByRole("link", { name: "View progress", exact: true }).click();
  await expect(
    page.getByText("SQL JOINs practice", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("SQL JOINs practice", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Switch to Professor/ }).click();
  await expect(
    page.getByRole("heading", { name: "Class Overview" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Aanya Shah", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Aanya Shah", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".chart-summary")).toContainText(
    "SQL JOINs: Proficient 100% · 5/5 questions",
  );
  await page
    .getByRole("button", { name: "Assign a resource", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Learning resource" })
    .selectOption("subqueries-1");
  await page
    .getByRole("button", { name: "Assign resource", exact: true })
    .click();
  await expect(
    page
      .locator(".assignment-row")
      .filter({ hasText: "Think inside the query" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Switch to Student/ }).click();
  await expect(
    page.getByRole("heading", { name: "From your Professor" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Think inside the query.*Assigned/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "From your Professor" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep my data" }).click();
  await expect(
    page.getByRole("heading", { name: "From your Professor" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Understand what/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await expect(
    page.getByRole("heading", { name: "From your Professor" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("resource edits, archive, restore, filters, and empty states", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Professor" }).click();
  if (!page.url().includes("/faculty/"))
    await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page.goto("/faculty/resources");
  await page.getByRole("button", { name: "Add a resource" }).click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Reading a SELECT query");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("A focused SQL walkthrough.");
  await page
    .getByRole("textbox", { name: "Lesson content", exact: true })
    .fill(
      "SELECT chooses the columns to return.\n\n```sql\nSELECT name FROM students;\n```",
    );
  await page.getByRole("button", { name: "Save resource" }).click();
  await expect(
    page.getByText("Reading a SELECT query", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Reading a SELECT query" })
    .click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Reading SELECT clearly");
  await page.getByRole("button", { name: "Save resource" }).click();
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goto("/student/library");
  await expect(
    page.getByRole("link", { name: "Reading SELECT clearly", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search library" })
    .fill("nothing-matches-this");
  await expect(
    page.getByRole("heading", { name: "No resources found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  if (!page.url().includes("/faculty/"))
    await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page.goto("/faculty/resources");
  await page
    .getByRole("button", { name: "Archive Reading SELECT clearly" })
    .click();
  await page
    .getByRole("button", { name: "Archive resource", exact: true })
    .click();
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goto("/student/library");
  await expect(
    page.getByRole("link", { name: "Reading SELECT clearly", exact: true }),
  ).toHaveCount(0);
  if (!page.url().includes("/faculty/"))
    await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page.goto("/faculty/resources");
  await page
    .getByRole("button", { name: "Restore Reading SELECT clearly" })
    .click();
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goto("/student/library");
  await expect(
    page.getByRole("link", { name: "Reading SELECT clearly", exact: true }),
  ).toBeVisible();
  await page.goto("/student/library?topic=joins");
  await expect(page.locator(".resource-card")).toHaveCount(3);
});
test("mobile navigation, profile selection and responsive routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/welcome-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome back, Aanya/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("link", { name: "Digital Library", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your digital library." }),
  ).toBeVisible();
  for (const path of [
    "/student/library",
    "/student/library/joins-1",
    "/student/quiz",
    "/student/learning-path",
    "/student/assistant",
    "/student/progress",
    "/faculty/dashboard",
    "/faculty/students/student-1",
    "/faculty/resources",
  ]) {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: path.startsWith("/faculty")
          ? "Explore as Professor"
          : "Explore as Student",
      })
      .click();
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `No horizontal overflow: ${path}`,
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await page.goto("/student/dashboard");
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page
    .getByRole("combobox", { name: "Student profile" })
    .selectOption("student-12");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Welcome back, Veer/ }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "View my learning path", exact: true })
    .click();
  await expect(
    page.getByText("Not assessed", { exact: true }).first(),
  ).toBeVisible();
});
