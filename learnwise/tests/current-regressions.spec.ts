import { test, expect } from "@playwright/test";
import { questions } from "../data/questions";

test("SQL Basics start and resource creation work without randomUUID", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() =>
    Object.defineProperty(crypto, "randomUUID", { value: undefined }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await page
    .getByRole("link", { name: "Knowledge Check", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "What would you like to check?" })
    .selectOption("basics");
  await page
    .getByRole("button", {
      name: /Let’s find your starting point|Start topic quiz/,
    })
    .click();
  await page.screenshot({
    path: "artifacts/quiz-start-current.png",
    fullPage: true,
  });
  await expect
    .soft(page.getByText("Question 1 of 5", { exact: true }))
    .toBeVisible();
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
  await page.getByRole("button", { name: "Submit assessment" }).dblclick();
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
  await page.reload();
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
  await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page
    .getByRole("link", { name: "Resource Management", exact: true })
    .click();
  await page.getByRole("button", { name: "Add a resource" }).click();
  await expect.soft(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Compatible browser lesson");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Created without randomUUID.");
  await page
    .getByRole("textbox", { name: "Lesson content", exact: true })
    .fill("SELECT name FROM students;");
  await page
    .getByRole("button", { name: "Save resource", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Preview Compatible browser lesson" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("an unfinished JOINs quiz must not block starting SQL Basics", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Student" }).click();
  await page.goto("/student/quiz?topic=joins");
  await page
    .getByRole("button", {
      name: /Let’s find your starting point|Start topic quiz/,
    })
    .click();
  await page.getByRole("radio").first().check();
  await page.goto("/student/quiz");
  await page
    .getByRole("combobox", { name: "What would you like to check?" })
    .selectOption("basics");
  await page.screenshot({
    path: "artifacts/quiz-existing-draft.png",
    fullPage: true,
  });
  await expect(
    page.getByRole("button", {
      name: /Let’s find your starting point|Start topic quiz/,
    }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Start topic quiz" }).click();
  await page.getByRole("radio").nth(1).check();
  await page.reload();
  await page
    .getByRole("combobox", { name: "What would you like to check?" })
    .selectOption("basics");
  await page
    .getByRole("button", { name: "Resume selected assessment" })
    .click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.goto("/student/quiz?topic=joins");
  await page
    .getByRole("button", { name: "Resume selected assessment" })
    .click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  const drafts = await page.evaluate(
    () => JSON.parse(localStorage.getItem("learnwise-demo-v1")!).drafts,
  );
  expect(Object.keys(drafts).sort()).toEqual([
    "student-1:basics",
    "student-1:joins",
  ]);
});

test("resource storage failure retains input, retries once, and validates fields inline", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Professor" }).click();
  await page.goto("/faculty/resources");
  await page.getByRole("button", { name: "Add a resource" }).click();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("   ");
  await page
    .getByRole("spinbutton", { name: "Study time (minutes)" })
    .fill("0");
  await page.getByRole("button", { name: "Save resource" }).click();
  await expect(
    page.getByRole("textbox", { name: "Title", exact: true }),
  ).toBeFocused();
  await expect(page.locator("#error-minutes")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Recoverable lesson");
  await page
    .getByRole("spinbutton", { name: "Study time (minutes)" })
    .fill("15");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Retain this explanation.");
  await page
    .getByRole("textbox", { name: "Lesson content", exact: true })
    .fill("Line one\nLine two\n\n```sql\nSELECT * FROM students;\n```");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "restoreTestStorage", {
      value: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Save resource" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("input is retained");
  await expect(
    page.getByRole("textbox", { name: "Title", exact: true }),
  ).toHaveValue("Recoverable lesson");
  await page.evaluate(() =>
    (
      window as unknown as { restoreTestStorage: () => void }
    ).restoreTestStorage(),
  );
  await page.getByRole("button", { name: "Save resource" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("learnwise-demo-v1")!),
  );
  expect(
    data.resources.filter(
      (r: { title: string }) => r.title === "Recoverable lesson",
    ),
  ).toHaveLength(1);
  await page.getByRole("link", { name: "Preview Recoverable lesson" }).click();
  await expect(page.locator("pre code")).toContainText(
    "SELECT * FROM students;",
  );
});
