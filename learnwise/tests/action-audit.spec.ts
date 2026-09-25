import { test, expect } from "@playwright/test";

test("shared navigation, student search, assistant scope, draft discard and form cancellation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore as Student" }).click();
  for (const [label, path] of [
    ["Digital Library", "library"], ["Knowledge Check", "quiz"], ["Learning Path", "learning-path"],
    ["Learning Assistant", "assistant"], ["My Progress", "progress"], ["Assigned Resources", "assignments"], ["Dashboard", "dashboard"],
  ]) {
    await page.getByRole("navigation").getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/student/${path}$`));
    await expect(page.locator("main h1")).toBeVisible();
  }
  await page.getByRole("textbox", { name: "Search learning resources" }).fill("normalization");
  await page.getByRole("textbox", { name: "Search learning resources" }).press("Enter");
  await expect(page.getByRole("textbox", { name: "Search library" })).toHaveValue("normalization");
  await expect(page.locator(".resource-card")).toHaveCount(3);
  await page.locator(".breadcrumb").getByRole("link", { name: "Student", exact: true }).click();
  await expect(page).toHaveURL(/student\/dashboard$/);
  await page.goto("/student/assistant");
  for (const [prompt, topic] of [["Explain SQL Basics", "SQL Basics"], ["Explain SQL JOINs", "SQL JOINs"], ["Explain normalization", "Normalization"], ["Explain subqueries", "Subqueries"]]) {
    await page.getByRole("textbox", { name: "Ask about a DBMS concept" }).fill(prompt);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator(".chat-topbar")).toContainText(topic);
  }
  await page.getByRole("textbox", { name: "Ask about a DBMS concept" }).fill("Write a poem about Mars");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".chat-message.assistant").last()).toContainText("can’t answer arbitrary questions");
  for (const topic of ["basics", "joins"]) {
    await page.goto(`/student/quiz?topic=${topic}`);
    await page.getByRole("button", { name: "Start topic quiz" }).click();
    await page.getByRole("radio").first().check();
  }
  await page.goto("/student/quiz?topic=basics");
  await page.getByRole("button", { name: "Discard draft", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start topic quiz" })).toBeEnabled();
  await page.getByRole("button", { name: "Discard SQL JOINs", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("learnwise-demo-v1")!).drafts)).toEqual({});
  await page.reload();
  await expect(page.getByRole("button", { name: /Resume/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to Professor" }).click();
  for (const [label, path] of [["Student Insights", "students"], ["Resource Management", "resources"], ["Class Overview", "dashboard"]]) {
    await page.getByRole("navigation").getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/faculty/${path}$`));
  }
  await page.goto("/faculty/resources");
  await page.getByRole("button", { name: "Add a resource" }).click();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Cancelled test resource");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Cancelled test resource", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Open demo profile menu" }).click();
  await page.getByRole("link", { name: "Welcome page", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Understand what/ })).toBeVisible();
  expect(errors).toEqual([]);
});
