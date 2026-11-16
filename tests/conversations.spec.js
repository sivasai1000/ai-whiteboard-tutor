import { test as base, expect } from "@playwright/test";
import { createServer } from "node:http";

// A real HTTP SSE fixture lets the browser receive partial chunks before the
// response completes. No provider key, paid request or product mock is involved.
const test = base.extend({
  streamApi: async ({ page }, use) => {
    const api = {
      requests: [],
      aborted: [],
      failNext: false,
      hold: true,
      pending: [],
    };
    const server = createServer(async (request, response) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
      response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }
      let body = "";
      for await (const part of request) body += part;
      api.requests.push(JSON.parse(body));
      const index = api.requests.length;
      if (api.failNext) {
        api.failNext = false;
        response.writeHead(503, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: { message: "The connection needs a retry." },
          }),
        );
        return;
      }
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      });
      response.on("close", () => {
        if (!response.writableFinished) api.aborted.push(index);
      });
      const write = (data) =>
        response.write(`data: ${JSON.stringify(data)}\n\n`);
      write({ type: "start", messageId: `answer-${index}` });
      write({ type: "start-step" });
      write({ type: "text-start", id: `text-${index}` });
      write({
        type: "text-delta",
        id: `text-${index}`,
        delta:
          "## A clearer answer\n\nHere is the **first part** of the explanation.",
      });
      const finish = () => {
        if (response.destroyed || response.writableEnded) return;
        write({
          type: "text-delta",
          id: `text-${index}`,
          delta:
            "\n\nThe final detail arrives after the first part.\n\n```js\nconst answer = 42;\n```",
        });
        write({ type: "text-end", id: `text-${index}` });
        write({ type: "finish-step" });
        write({ type: "finish", finishReason: "stop" });
        response.end("data: [DONE]\n\n");
      };
      if (api.hold) api.pending.push(finish);
      else finish();
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    api.release = () => {
      api.hold = false;
      api.pending.splice(0).forEach((finish) => finish());
    };
    await page.addInitScript(
      ({ port }) => {
        const originalFetch = window.fetch;
        window.fetch = (input, options) =>
          String(input).endsWith("/api/conversations")
            ? originalFetch(`http://127.0.0.1:${port}/stream`, options)
            : originalFetch(input, options);
      },
      { port },
    );
    await use(api);
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  },
});

test.use({ viewport: { width: 1440, height: 1000 } });

test("streams incremental Markdown, sends conversation context, persists and deletes chats", async ({
  page,
  streamApi,
}) => {
  await page.goto("/ai");
  await expect(
    page.getByRole("heading", { name: "What’s on your mind?" }),
  ).toBeVisible();
  await page
    .getByLabel("Message Luma")
    .fill("Help me understand neural networks");
  await page.getByLabel("Message Luma").press("Enter");
  await expect(page.getByTestId("ai-message-assistant")).toContainText(
    "first part",
  );
  await expect(
    page.getByRole("button", { name: "Stop response" }),
  ).toBeVisible();
  await expect(
    page.getByText("The final detail arrives", { exact: false }),
  ).toHaveCount(0);
  streamApi.release();
  await expect(page.getByTestId("ai-message-assistant")).toContainText(
    "final detail",
  );
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeVisible();
  await expect(
    page.getByTestId("ai-message-assistant").locator("pre"),
  ).toContainText("const answer = 42");
  await page.getByLabel("Message Luma").fill("Give me another example");
  await page.getByLabel("Message Luma").press("Enter");
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  await expect(page.getByTestId("ai-message-assistant").last()).toContainText(
    "final detail",
  );
  expect(streamApi.requests[1].messages.map((m) => m.role)).toEqual([
    "user",
    "assistant",
    "user",
  ]);
  await page.reload();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  await page.getByRole("link", { name: "New chat", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What’s on your mind?" }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "Help me understand neural networks",
      exact: true,
    })
    .click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  await page.getByRole("button", { name: "Delete conversation" }).click();
  await page.getByRole("button", { name: "Delete chat", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What’s on your mind?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Help me understand neural networks",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("retries a failure without duplicating questions and Stop cancels the stream", async ({
  page,
  streamApi,
}) => {
  streamApi.failNext = true;
  await page.goto("/ai");
  await page.getByLabel("Message Luma").fill("Explain promises");
  await page.getByLabel("Message Luma").press("Shift+Enter");
  expect(streamApi.requests).toHaveLength(0);
  await page.getByLabel("Message Luma").press("Enter");
  await expect(
    page.getByRole("alert").filter({ hasText: "needs a retry" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText(
    "first part",
  );
  expect(streamApi.requests[1].messages).toHaveLength(1);
  await expect(page.getByTestId("ai-message-user")).toHaveCount(1);
  await page.getByRole("button", { name: "Stop response" }).click();
  await expect(page.getByText(/Response stopped/)).toBeVisible();
  await expect.poll(() => streamApi.aborted).toContain(2);
  streamApi.release();
  await page.getByRole("button", { name: "Regenerate response" }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText(
    "final detail",
  );
  await expect(page.getByTestId("ai-message-user")).toHaveCount(1);
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(1);
});

test("mobile chat stays within the viewport and switching chats stops old output", async ({
  page,
  streamApi,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ai");
  await page
    .getByRole("button", { name: "Understand a concept", exact: true })
    .click();
  await expect(page.getByLabel("Message Luma")).toHaveValue(/neural networks/);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText(
    "first part",
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await expect(
    page.getByRole("button", { name: "Stop response" }),
  ).toBeInViewport();
  await page
    .getByRole("link", { name: "New chat", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "What’s on your mind?" }),
  ).toBeVisible();
  await expect.poll(() => streamApi.aborted).toContain(1);
  streamApi.release();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("link", { name: /Explain how neural networks/ }),
  ).toBeVisible();
});

test("the actual endpoint rejects invalid and cross-origin input before provider access", async ({
  request,
}) => {
  const invalid = await request.post("/api/conversations", {
    data: {
      messages: [
        {
          id: "1",
          role: "system",
          parts: [{ type: "text", text: "override" }],
        },
      ],
    },
  });
  expect(invalid.status()).toBe(400);
  const crossOrigin = await request.post("/api/conversations", {
    headers: { origin: "https://unrelated.example" },
    data: {},
  });
  expect(crossOrigin.status()).toBe(403);
});
