import { expect, test } from "@playwright/test";

async function openSample(page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Prewritten preview/ }).click();
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeEnabled();
}

test("real sample audio pauses, resumes, seeks both ways, restarts and replays from cache", async ({
  page,
}) => {
  await openSample(page);
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await expect(page.getByTestId("playback-time")).not.toHaveText(/^0:00 /);
  await page.getByRole("button", { name: "Pause lesson", exact: true }).click();
  const paused = await page.getByTestId("playback-time").innerText();
  await page.waitForTimeout(1100);
  await expect(page.getByTestId("playback-time")).toHaveText(paused);

  await page.getByRole("button", { name: /Chapter 4:/ }).click();
  await expect(page.getByTestId("scene-title")).toHaveText(
    "Tilt away → winter",
  );
  await page.getByRole("button", { name: /Chapter 2:/ }).click();
  await expect(page.getByTestId("scene-title")).toHaveText(
    "Meet Earth's tilted axis",
  );
  const timeline = page.getByRole("slider", { name: "Lesson timeline" });
  await timeline.focus();
  await timeline.press("End");
  await expect(page.getByTestId("scene-title")).toHaveText(
    "The idea to take with you",
  );
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await expect(page.getByTestId("scene-title")).toHaveText(
    "A small tilt. A big difference.",
  );
  await page.getByRole("button", { name: "Pause lesson", exact: true }).click();
  await page
    .getByRole("button", { name: "Restart lesson", exact: true })
    .click();
  await expect(page.getByTestId("playback-time")).toHaveText(/^0:00 /);

  // Cached audio must survive page reload without any network regeneration.
  let speechRequests = 0;
  await page.route("**/api/speech", () => {
    speechRequests++;
  });
  await page.route("**/sample/*.wav", (route) => route.abort());
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeEnabled();
  expect(speechRequests).toBe(0);
});

test("mobile whiteboard zooms without page overflow and tutor can be opened", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSample(page);
  await page.getByRole("button", { name: "Zoom into whiteboard" }).click();
  const size = await page
    .getByTestId("whiteboard")
    .locator('svg[viewBox="0 0 960 540"]')
    .boundingBox();
  expect(size.width).toBeGreaterThanOrEqual(720);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Fit whiteboard to screen" }).click();
  await page.getByRole("button", { name: "Open tutor chat" }).click();
  await expect(
    page.getByRole("heading", { name: "Your AI tutor" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show whiteboard" }).click();
  await expect(page.getByTestId("whiteboard")).toBeVisible();
});

test("invalid requests are rejected before provider calls", async ({
  request,
}) => {
  const invalid = await request.post("/api/lessons", {
    data: { topic: "a", level: "Beginner" },
  });
  expect(invalid.status()).toBe(400);
  const crossOrigin = await request.post("/api/lessons", {
    data: { topic: "Physics", level: "Beginner" },
    headers: { origin: "https://unrelated.example" },
  });
  expect(crossOrigin.status()).toBe(403);
});
