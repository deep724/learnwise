import { test, expect } from "@playwright/test";
const routes = [
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
];
test("all routes render at desktop, tablet, and mobile widths", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of routes) {
      await page.goto("/");
      await page
        .getByRole("button", {
          name: route.startsWith("/faculty")
            ? "Explore as Professor"
            : "Explore as Student",
        })
        .click();
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (width > 800) {
        const geometry = await page.evaluate(() => ({
          sidebarRight: document
            .querySelector(".sidebar")!
            .getBoundingClientRect().right,
          bodyLeft: document.querySelector(".app-body")!.getBoundingClientRect()
            .left,
        }));
        expect(
          geometry.bodyLeft,
          `Sidebar must not cover content: ${route} at ${width}`,
        ).toBeGreaterThanOrEqual(geometry.sidebarRight - 1);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + " at " + width,
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/review-${width}-${route.slice(1).replaceAll("/", "-")}.png`,
        fullPage: true,
      });
    }
  }
  expect(errors).toEqual([]);
});
