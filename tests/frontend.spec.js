import { test, expect } from "@playwright/test";

const origin = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";

test.use({ viewport: { width: 1440, height: 1000 } });

async function openSample(page) {
  await page.goto(origin);
  await page.getByRole("button", { name: /Prewritten preview/ }).click();
  await page.waitForURL("**/lesson/**");
}

test("a failed generation is recoverable and New lesson clears a draft", async ({
  page,
}) => {
  await page.route("**/api/lessons", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: { message: "The AI service is temporarily unavailable." },
      }),
    }),
  );
  await page.goto(origin);
  const topic = page.getByLabel("What would you like to understand?");
  await topic.fill("Explain how seasons work");
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "temporarily unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start learning" }),
  ).toBeEnabled();
  await page.getByRole("link", { name: /^New lesson/ }).click();
  await expect(topic).toHaveValue("");
});

test("bookmarks persist after reload, unsaving and deletion update the library", async ({
  page,
}) => {
  await openSample(page);
  await page.getByRole("button", { name: "Save lesson", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unsave lesson", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Saved lessons/ }).click();
  await page.waitForURL("**/saved");
  await expect(
    page.getByRole("heading", { name: "Good ideas are worth keeping." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Why do we have seasons?" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Why do we have seasons?" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Unsave Why do we have seasons?",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Keep your first discovery." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "History", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Delete Why do we have seasons?",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Delete lesson", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your first discovery is waiting." }),
  ).toBeVisible();
});

test("chat supports keyboard input, retries without duplication, and persists the answer", async ({
  page,
}) => {
  const requests = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: requests.length === 1 ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        requests.length === 1
          ? { error: { message: "The tutor is temporarily unavailable." } }
          : {
              answer:
                "Earth’s tilt changes the sunlight angle and the length of the day.",
            },
      ),
    });
  });
  await openSample(page);
  const question = page.getByLabel("Ask a follow-up question");
  await question.fill("How does tilt change sunlight?");
  await question.press("Shift+Enter");
  expect(requests).toHaveLength(0);
  await question.press("Enter");
  await expect(
    page.getByRole("alert").filter({ hasText: "temporarily unavailable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByTestId("chat-message-assistant")).toContainText(
    "sunlight angle",
  );
  expect(requests).toHaveLength(2);
  expect(requests[1].messages).toHaveLength(1);
  await page.reload();
  await expect(page.getByTestId("chat-message-assistant")).toContainText(
    "sunlight angle",
  );
  await expect(page.getByTestId("chat-message-user")).toHaveCount(1);
});

test("Explore filters topics, prefills the composer, and mobile navigation works", async ({
  page,
}) => {
  await page.goto(`${origin}/explore`);
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3);
  await page.getByRole("link", { name: /Calculus without/ }).click();
  await expect(
    page.getByLabel("What would you like to understand?"),
  ).toHaveValue(/derivatives/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "History", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pick up where curiosity left off." }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
