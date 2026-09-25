import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("pages meet automated WCAG A/AA checks", async ({ page }) => {
  test.setTimeout(180000);
  for (const route of [
    "/",
    "/student/dashboard",
    "/student/library",
    "/student/library/joins-1",
    "/student/quiz",
    "/student/learning-path",
    "/student/assistant",
    "/student/progress",
    "/student/assignments",
    "/faculty/dashboard",
    "/faculty/students",
    "/faculty/students/student-1",
    "/faculty/resources",
    "/faculty/resources/joins-1",
  ]) {
    await page.goto("/");
    if (route !== "/")
      await page
        .getByRole("button", {
          name: route.startsWith("/faculty")
            ? "Explore as Professor"
            : "Explore as Student",
        })
        .click();
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    if (
      ["/student/library", "/student/assistant", "/faculty/dashboard"].includes(
        route,
      )
    )
      await page.screenshot({
        path: `artifacts/${route.slice(1).replaceAll("/", "-")}.png`,
        fullPage: true,
      });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect
      .soft(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        route,
      )
      .toEqual([]);
  }
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await page.goto("/student/quiz");
  await page
    .getByRole("button", { name: /Start diagnostic|Start topic quiz/ })
    .click();
  await page.getByRole("radio").first().check();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/student/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("dialog", { name: "Main navigation" }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
});
