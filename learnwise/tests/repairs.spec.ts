import { test, expect, type Page } from "@playwright/test";
import { questions } from "../data/questions";
import { freshState } from "../lib/storage";
const key = "learnwise-demo-v1";
const enter = async (page: Page, role = "Student") => {
  await page.goto("/");
  await page
    .getByRole("button", { name: `Explore as ${role}`, exact: true })
    .click();
};
const saved = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  (page as Page & { appErrors: string[] }).appErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { appErrors: string[] }).appErrors).toEqual([]);
});
test("professor filters and lesson shortcuts retain role, assignments reach only the selected student", async ({
  page,
}) => {
  await enter(page, "Professor");
  await page.getByRole("combobox", { name: "Demo class" }).selectOption("CE–B");
  await page
    .getByRole("combobox", { name: "Topic coverage" })
    .selectOption("joins");
  await expect(page.locator(".heatmap tbody tr")).toHaveCount(4);
  await page
    .getByRole("link", { name: "View suggested SQL JOINs lesson" })
    .click();
  await expect(page).toHaveURL(/faculty\/resources\/joins-1/);
  await page.getByRole("link", { name: "Assign to a student" }).click();
  await page.getByRole("link", { name: "Veer Pandya", exact: true }).click();
  await page
    .getByRole("button", { name: "Assign a resource", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Learning resource" })
    .selectOption("joins-1");
  await page
    .getByRole("button", { name: "Assign resource", exact: true })
    .press("Enter");
  await page
    .getByRole("button", { name: "View assignments and notifications" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Making sense of SQL JOINs/ })
    .click();
  await expect(page).toHaveURL(/faculty\/students\/student-12/);
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page
    .getByRole("link", { name: "Assigned Resources", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "No resources assigned yet" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page
    .getByRole("combobox", { name: "Student profile" })
    .selectOption("student-12");
  await page.getByRole("link", { name: /Making sense of SQL JOINs/ }).click();
  await expect(
    page.getByRole("heading", { name: "Making sense of SQL JOINs" }),
  ).toBeVisible();
});
test("assistant input and valid keyboard submission update comparable progress and history", async ({
  page,
}) => {
  await enter(page);
  await page.goto("/student/assistant");
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Ask about a DBMS concept" })
    .fill("Explain INNER JOIN simply.");
  await page
    .getByRole("textbox", { name: "Ask about a DBMS concept" })
    .press("Enter");
  await expect(page.locator(".chat-message.assistant")).toContainText("JOIN");
  await page
    .getByRole("button", { name: "Give me a practice question", exact: true })
    .click();
  await expect(page.locator(".chat-message.assistant")).toHaveCount(2);
  await page.getByRole("button", { name: "New conversation" }).click();
  await expect(page.locator(".chat-message")).toHaveCount(0);
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto("/student/quiz?topic=joins");
    await page
      .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
      .click();
    for (let i = 0; i < 5; i++) {
      const legend = await page.locator("legend").innerText();
      const q = questions.find((q) => legend.includes(q.text))!;
      await page
        .getByRole("radio")
        .nth(attempt ? q.correct : (q.correct + 1) % 4)
        .check();
      await page
        .getByRole("button", {
          name: i === 4 ? "Review answers" : "Next question",
          exact: true,
        })
        .click();
    }
    await page
      .getByRole("button", { name: "Submit assessment" })
      .press("Enter");
    await expect(
      page.getByText(attempt ? "5 of 5 correct" : "0 of 5 correct"),
    ).toBeVisible();
  }
  await page.getByRole("link", { name: "View progress", exact: true }).click();
  await expect(
    page.getByText("+100 percentage points", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "View results", exact: true })
    .first()
    .click();
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
  await page.getByRole("button", { name: "Try another quiz" }).click();
  await expect(
    page.getByRole("combobox", { name: "What would you like to check?" }),
  ).toHaveValue("joins");
});
test("explicit roles survive wrong URLs, previews, search, history, and refresh", async ({
  page,
}) => {
  await page.goto("/faculty/resources");
  await expect(page).toHaveURL(/\/$/);
  await enter(page);
  await page.goto("/faculty/resources");
  await expect(
    page.getByRole("heading", {
      name: "This page belongs to another workspace",
    }),
  ).toBeVisible();
  expect((await saved(page)).role).toBe("student");
  await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page
    .getByRole("link", { name: "Resource Management", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "Preview Making sense of SQL JOINs",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/faculty\/resources\/joins-1/);
  await expect(
    page.getByRole("heading", { name: "Professor resource preview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mark as studied", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open demo profile menu" }),
  ).toContainText("Professor demo");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Resource Management" }),
  ).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Professor resource preview" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search learning resources" })
    .fill("normalization");
  await page
    .getByRole("textbox", { name: "Search learning resources" })
    .press("Enter");
  await expect(page).toHaveURL(/faculty\/resources\?q=normalization/);
  await expect(
    page.getByRole("textbox", { name: "Search managed resources" }),
  ).toHaveValue("normalization");
  await page.goto("/faculty/students/student-2");
  await expect(
    page.getByRole("button", { name: "Open demo profile menu" }),
  ).toContainText("Professor demo");
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await expect(
    page.getByRole("combobox", { name: "Student profile" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", {
      name: "This page belongs to another workspace",
    }),
  ).toBeVisible();
  expect((await saved(page)).role).toBe("student");
});
test("quiz drafts, keyboard submission, repeated submit, refreshed results, varied retake", async ({
  page,
}) => {
  await enter(page);
  await page.goto("/student/quiz?topic=joins");
  await page
    .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
    .click();
  const first = (await saved(page)).drafts["student-1:joins"].questions;
  await page.getByRole("radio").first().check();
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Previous question", exact: true })
    .click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  await page.reload();
  await page.getByRole("button", { name: "Resume draft" }).click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  await page.getByRole("button", { name: "Review all answers" }).click();
  await page.getByRole("button", { name: "Submit assessment" }).press("Enter");
  await expect(page.getByRole("alert")).toContainText(
    "4 questions are unanswered",
  );
  await page
    .getByRole("button", { name: "Go to first unanswered question" })
    .click();
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page
      .getByRole("button", { name: new RegExp(`^Question ${i + 1},`) })
      .click();
    const legend = await page.locator("legend").innerText();
    const q = questions.find((q) => legend.includes(q.text))!;
    await page.getByRole("radio").nth(q.correct).check();
  }
  const before = (await saved(page)).attempts.length;
  await page.getByRole("button", { name: "Review all answers" }).click();
  await page.locator("form.pre-submit").evaluate((form) => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
  expect((await saved(page)).attempts).toHaveLength(before + 1);
  await expect(page.locator(".review-card")).toHaveCount(5);
  await page.reload();
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
  await page.getByRole("link", { name: "Explain this answer" }).first().click();
  await expect(page.locator(".chat-message.assistant")).toContainText(
    "Correct answer:",
  );
  await page.goto("/student/quiz?topic=joins");
  await page
    .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
    .click();
  expect((await saved(page)).drafts["student-1:joins"].questions).not.toEqual(
    first,
  );
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
});
test("profiles isolate drafts, bookmarks, assignments, history, and assistant context", async ({
  page,
}) => {
  await enter(page);
  await page.goto("/student/quiz?topic=basics");
  await page
    .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
    .click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page
    .getByRole("combobox", { name: "Student profile" })
    .selectOption("student-12");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Resume draft" })).toHaveCount(
    0,
  );
  await page.goto("/student/progress");
  await expect(
    page.getByRole("heading", { name: "Your progress story is waiting." }),
  ).toBeVisible();
  await page.goto("/student/library");
  await page.getByRole("button", { name: "Bookmarked", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No resources found" }),
  ).toBeVisible();
  await page.goto("/student/assignments");
  await expect(
    page.getByRole("heading", { name: "No resources assigned yet" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page
    .getByRole("combobox", { name: "Student profile" })
    .selectOption("student-1");
  await page.goto("/student/quiz");
  await page
    .getByRole("button", { name: "Resume SQL Basics", exact: true })
    .click();
  await expect(page.getByRole("radio").first()).toBeChecked();
});
test("resource validation, keyboard save, modal escape, and combined library filters", async ({
  page,
}) => {
  await enter(page, "Professor");
  await page.goto("/faculty/resources");
  await page.getByRole("button", { name: "Add a resource" }).click();
  await page.getByRole("button", { name: "Save resource" }).press("Enter");
  await expect(page.getByRole("alert")).toContainText("Add a title");
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Keyboard saved lesson");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("A useful lesson");
  await page
    .getByRole("textbox", { name: "Lesson content", exact: true })
    .fill("SELECT name FROM students;");
  await page.getByRole("button", { name: "Save resource" }).press("Enter");
  await expect(
    page.getByText("Keyboard saved lesson", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Keyboard saved lesson" })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goto("/student/library");
  await page
    .getByRole("combobox", { name: "Topic", exact: true })
    .selectOption("basics");
  await page
    .getByRole("combobox", { name: "Resource type", exact: true })
    .selectOption("Lesson");
  await page
    .getByRole("combobox", { name: "Difficulty", exact: true })
    .selectOption("Beginner");
  await page
    .getByRole("combobox", { name: "Study time", exact: true })
    .selectOption("10");
  await page
    .getByRole("textbox", { name: "Search library" })
    .fill("Keyboard saved");
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Bookmark Keyboard saved lesson",
      exact: true,
    })
    .click();
  await page.reload();
  await page
    .getByRole("button", {
      name: "Remove bookmark from Keyboard saved lesson",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Bookmark Keyboard saved lesson",
      exact: true,
    }),
  ).toBeVisible();
});
test("malformed and legacy data recover, invalid IDs are understandable, storage failures stay honest", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate((k) => localStorage.setItem(k, "{bad"), key);
  await page.reload();
  await expect(page.getByRole("status")).toContainText(
    "Saved demo data could not be read",
  );
  const legacy = freshState() as unknown as Record<string, unknown>;
  delete legacy.sessionActive;
  delete legacy.drafts;
  (legacy.resources as { title: string }[])[0].title =
    "Preserved existing lesson";
  await page.evaluate(
    ({ key, legacy }) => localStorage.setItem(key, JSON.stringify(legacy)),
    { key, legacy },
  );
  await page.reload();
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await page.goto("/student/library/bad-id");
  await expect(
    page.getByRole("heading", { name: "Resource not found" }),
  ).toBeVisible();
  await page.goto("/student/quiz?attempt=bad-id");
  await expect(
    page.getByRole("heading", { name: "Assessment not found" }),
  ).toBeVisible();
  await page.goto("/unknown");
  await expect(
    page.getByRole("link", { name: "Back to LearnWise" }),
  ).toBeVisible();
  expect((await saved(page)).resources[0].title).toBe(
    "Preserved existing lesson",
  );
  await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page.goto("/faculty/students/missing");
  await expect(
    page.getByRole("heading", { name: "Student not found" }),
  ).toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await expect(page.locator(".storage-notice")).toContainText("session-only");
  await page
    .getByRole("link", { name: "Digital Library", exact: true })
    .click();
  // Inject after navigation too: the simulated failure is deliberately page-local.
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", {
      name: "Bookmark Preserved existing lesson",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Remove bookmark from Preserved existing lesson",
    }),
  ).toBeVisible();
  await expect(page.locator(".toast")).toContainText("session only");
  await expect(page.locator(".toast")).not.toContainText("saved");
});
test("mobile role switching closes navigation, notifications respect professor role, sidebar collapse works", async ({
  page,
}) => {
  await enter(page);
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-small/);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Switch to Professor" }).click();
  await expect(
    page.getByRole("dialog", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(page.locator(".app-body")).not.toHaveAttribute("inert", "");
  await page
    .getByRole("button", { name: "View assignments and notifications" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Class assignments" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome back, Aanya/ }),
  ).toBeVisible();
});
