import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { freshState } from "../lib/storage";
import { selectQuestions } from "../lib/quiz";

test("legacy draft browser migration and recovery preserve original records", async ({
  page,
}) => {
  const legacy = freshState();
  legacy.sessionActive = true;
  const qs = selectQuestions("basics", 0);
  legacy.drafts[legacy.profileId] = {
    id: "legacy-draft",
    topic: "basics",
    questions: qs.map((q) => q.id),
    answers: { [qs[0].id]: 1 },
  };
  legacy.resources[0].title = "User edited lesson";
  await page.goto("/");
  await page.evaluate(
    (s) => localStorage.setItem("learnwise-demo-v1", JSON.stringify(s)),
    legacy,
  );
  await page.goto("/student/quiz?topic=basics");
  await page
    .getByRole("button", { name: "Resume selected assessment" })
    .click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.goto("/student/library/basics-1");
  await expect(
    page.getByRole("heading", { name: "User edited lesson" }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("learnwise-demo-v1", "{original-unreadable"),
  );
  await page.reload();
  await expect(page.getByRole("status")).toContainText("original is retained");
  expect(
    await page.evaluate(() => localStorage.getItem("learnwise-demo-recovery")),
  ).toBe("{original-unreadable");
});

test("archived assignments remain readable, studying is scoped, repeated assignment is unique", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Professor" }).click();
  await page.goto("/faculty/students/student-1");
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole("button", { name: "Assign a resource", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Learning resource" })
      .selectOption("joins-1");
    await page
      .getByRole("button", { name: "Assign resource", exact: true })
      .click();
  }
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("learnwise-demo-v1")!),
  );
  expect(before.assignments).toHaveLength(1);
  await page.goto("/faculty/resources");
  await page
    .getByRole("button", {
      name: "Archive Making sense of SQL JOINs",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Keep resource" }).click();
  await expect(
    page.getByRole("button", {
      name: "Archive Making sense of SQL JOINs",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Archive Making sense of SQL JOINs",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Archive resource", exact: true })
    .click();
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goto("/student/assignments");
  await page.getByRole("link", { name: /Making sense of SQL JOINs/ }).click();
  await expect(page.getByText("Archived · Historical access")).toBeVisible();
  await page
    .getByRole("button", { name: "Mark as studied", exact: true })
    .click();
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("learnwise-demo-v1")!),
  );
  expect(after.attempts).toEqual(before.attempts);
  expect(
    after.studied.filter(
      (a: { resourceId: string; studentId: string }) =>
        a.resourceId === "joins-1" && a.studentId === "student-1",
    ),
  ).toHaveLength(1);
  await page.goto("/student/assignments");
  await expect(page.locator("main")).toContainText("Studied");
  await page.getByRole("button", { name: "Switch to Professor" }).click();
  await page.goto("/faculty/students/student-1");
  await page
    .getByRole("button", { name: "Assign a resource", exact: true })
    .click();
  await expect(
    page
      .getByRole("combobox", { name: "Learning resource" })
      .locator('option[value="joins-1"]'),
  ).toHaveCount(0);
});

test("resource dialog traps focus, retains padding clicks, exposes validation and returns focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Professor" }).click();
  await page.goto("/faculty/resources");
  await page.getByRole("button", { name: "Add a resource" }).click();
  await page.getByRole("dialog").click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Save resource" }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Save resource" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: "artifacts/resource-validation.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Add a resource" }),
  ).toBeFocused();
});

test("touch quiz workflow and 200 percent equivalent layout reflow", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5186/");
  await page.getByRole("button", { name: "Explore as Student" }).tap();
  await page.getByRole("button", { name: "Open navigation" }).tap();
  await page.getByRole("link", { name: "Knowledge Check", exact: true }).tap();
  await page
    .getByRole("combobox", { name: "What would you like to check?" })
    .selectOption("basics");
  await page.getByRole("button", { name: "Start topic quiz" }).tap();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("radio").first().tap();
    await page
      .getByRole("button", {
        name: i === 4 ? "Review answers" : "Next question",
        exact: true,
      })
      .tap();
  }
  await page.screenshot({
    path: "artifacts/mobile-quiz-review.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Submit assessment" }).tap();
  await expect(
    page.getByRole("heading", { name: "Assessment results", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".review-card")).toHaveCount(5);
  await context.close();
  // 1440x1000 display at 200% maps to 720x500 CSS pixels with a 2x scale.
  const zoom = await browser.newContext({
    viewport: { width: 720, height: 500 },
    deviceScaleFactor: 2,
  });
  const zoomPage = await zoom.newPage();
  await zoomPage.goto("http://127.0.0.1:5186/");
  await zoomPage.getByRole("button", { name: "Explore as Student" }).click();
  for (const route of ["dashboard", "quiz", "library", "progress"]) {
    await zoomPage.goto(`http://127.0.0.1:5186/student/${route}`);
    expect(
      await zoomPage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
    await expect(zoomPage.locator("main h1")).toBeVisible();
  }
  await zoomPage.screenshot({
    path: "artifacts/zoom-equivalent-progress.png",
    fullPage: true,
  });
  await zoom.close();
});
