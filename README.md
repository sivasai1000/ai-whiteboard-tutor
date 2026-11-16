# Luma — AI Interactive Whiteboard Tutor

A focused learning space: enter a topic, generate a short lesson, and listen while an interactive whiteboard explains it step by step. Built for the Braynix Studios AI Whiteboard Tutor assignment.

## Run locally

Prerequisites: Node.js 22.12+ (Node 24 recommended), npm, and an OpenAI API account with credits and access to the configured models.

```bash
npm ci
cp .env.example .env.local
```

Set `OPENAI_API_KEY` in `.env.local`, then run:

```bash
npm run dev
```

Open **http://127.0.0.1:3000**. New AI lessons and follow-up answers require the API key. The **Prewritten preview** works immediately without credentials and is explicitly labelled as a sample. It is not presented as live AI output.

## What works

- Chat-first topic input with Beginner and Intermediate teaching levels.
- Real structured AI lessons for arbitrary educational topics, targeting approximately two minutes.
- SVG diagrams with shapes, arrows, labels, equations and progressive annotations.
- Generated spoken narration, with the audio clock driving the visual timeline.
- Play, pause, resume, seek, restart, replay, playback speed and chapter navigation.
- Whiteboard zoom and scrolling for small screens.
- AI follow-up chat that receives the current lesson as context.
- Explore topics, lesson history, bookmarks and confirmed deletion.
- Local persistence of lesson data, chat and narration in IndexedDB.
- Dark responsive UI using Tailwind CSS, feature-level `style.js` files and shadcn/ui.
- Loading, error and retry states; keyboard controls and accessible input labels.

## Stack

| Concern             | Implementation                                                        |
| ------------------- | --------------------------------------------------------------------- |
| Framework           | Next.js App Router + React                                            |
| Language            | JavaScript (`.jsx` components, `.js` logic)                           |
| Styling             | Tailwind CSS v4 + shadcn/ui + local Inter font                        |
| AI lessons and chat | OpenAI Responses API, configurable `gpt-6-luna` default               |
| Narration           | OpenAI Realtime API, configurable `gpt-realtime-2.1-mini` default     |
| Graphics            | React-rendered SVG; the model returns data, never executable graphics |
| Playback            | HTMLAudioElement + deterministic timeline functions                   |
| Local storage       | IndexedDB through `idb`                                               |
| Validation          | Zod                                                                   |
| Tests               | Vitest + Playwright                                                   |

Model IDs are configurable. Availability depends on the OpenAI account. The older Speech API models are not used by default. See the official [model catalogue](https://developers.openai.com/api/docs/models) and [deprecation schedule](https://developers.openai.com/api/docs/deprecations).

## Folder structure

```text
src/
  app/                       Pages, layouts and thin API route handlers
    api/lessons/             Generate a validated lesson
    api/speech/              Generate signed narration as WAV
    api/chat/                Answer a lesson-related question
    api/health/              Configuration status, never credentials
    explore/                 Topic discovery
    history/                 Lessons on this device
    saved/                   Bookmarked lessons
    lesson/[id]/             Interactive teaching workspace
    globals.css              Tailwind imports and shared theme tokens
  components/
    ui/                      shadcn/ui building blocks
    layout/                  Shared sidebar, shell and mobile navigation
    shared/                  Reusable loading/error/empty-state UI
  features/
    welcome/                 Topic input and discovery
    lesson/                  Whiteboard, timeline, player and playback hook
    tutor/                   Follow-up conversation
    library/                 Lesson provider and library screens
  server/                    OpenAI services, prompts, signing and request limits
  lib/                       Validation, browser storage and shared utilities
tests/                       Unit, integration and browser tests
public/sample/               Bundled narration for the disclosed preview
docs/architecture.md         Data flow and interview walkthrough
```

Pages compose feature components. Components render the interface. Hooks own browser behavior. Services handle provider calls. API routes validate requests and delegate to services. Feature `style.js` files hold reusable Tailwind class strings; small one-off utilities can remain beside JSX. `globals.css` contains framework/theme setup rather than page-specific CSS.

## How synchronization works

1. The AI returns narration and a diagram for each chapter. Each diagram element has an `appearAt` fraction within its chapter.
2. The backend signs each chapter's narration. The browser requests audio for those signed passages, at most two chapters concurrently.
3. The voice response is collected into a standard WAV file. The browser measures the **actual audio duration** and stores it locally.
4. Measured durations define chapter boundaries on a single lesson timeline.
5. While audio plays, its `currentTime` determines the active chapter and visible diagram elements.
6. Seeking recalculates the complete board state from the requested time, including when moving backward. Restart selects time zero; replay uses the saved audio.

The system synchronizes at chapter and scheduled visual-event level. Reveal times inside a chapter are proportional to its measured duration; they are **not word-level forced alignment**. The diagram plan asks the narrator to explain elements in reveal order. This tradeoff keeps playback deterministic and affordable while retaining clear visual teaching.

See [architecture.md](docs/architecture.md) for the full flow and implementation walkthrough.

## Environment variables

Use `.env.example` as the complete configuration reference. All these variables are server-only; none use `NEXT_PUBLIC_`.

| Variable                   | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `OPENAI_API_KEY`           | Required for real AI lessons, voice and chat                    |
| `OPENAI_TEXT_MODEL`        | Lesson/chat model; defaults to `gpt-6-luna`                     |
| `OPENAI_SPEECH_MODEL`      | Realtime voice model; defaults to `gpt-realtime-2.1-mini`       |
| `OPENAI_VOICE`             | Voice, default `marin`                                          |
| `NARRATION_SIGNING_SECRET` | Optional separate signing key; otherwise the API key is used    |
| `APP_ORIGIN`               | Optional canonical URL for origin validation                    |
| `DAILY_LESSON_LIMIT`       | Default 20 new lesson requests per limit window                 |
| `DAILY_SPEECH_LIMIT`       | Default 180 narration requests per limit window                 |
| `DAILY_CHAT_LIMIT`         | Default 120 chat requests per limit window                      |
| `UPSTASH_REDIS_REST_URL`   | Optional shared Redis limiter endpoint                          |
| `UPSTASH_REDIS_REST_TOKEN` | Optional shared Redis limiter credential                        |
| `TRUST_PROXY`              | Enable only behind a proxy that overwrites forwarded IP headers |

Never commit `.env.local` or any real key. Credentials are never sent to the browser or stored in lessons. The backend logs safe error codes and request IDs, not prompts or credentials.

## Cost controls and public-demo limits

- Lesson and answer lengths are bounded; automatic SDK retries are disabled.
- A small model is used for lesson data and chat; narration is generated once and cached.
- The browser caches each completed audio chapter, including before a later chapter fails.
- Replaying, seeking and restarting do not generate new AI content.
- The narration endpoint requires a signed passage generated by the lesson service.
- Requests have body-size bounds, timeouts, origin checks, and global/IP/session quotas.
- Shared Redis limits check and increment all buckets atomically. Denied visitors do not consume another visitor's global allowance.

**Without Redis, limits and the short-lived server audio cache are per-process.** Serverless restarts or multiple instances reset/partition them. Configure Redis for durable shared limits before exposing the API to broad traffic. These request quotas are not a guaranteed dollar spending cap; monitor the provider's billing dashboard and account controls.

## Tests and verification

```bash
npm test
npm run build
```

For browser tests:

```bash
npx playwright install chromium
npm run test:e2e
```

To use an installed Google Chrome instead:

```bash
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

Playwright starts the local server automatically if needed. To test an already-running production server, use `E2E_BASE_URL=https://your-deployment.example npm run test:e2e` (sample and mocked-provider scenarios only).

The suite covers validated lesson data, malformed requests, cross-origin requests, token tampering/expiry, quota isolation, WAV generation, Realtime protocol handling, actual sample audio playback, pause/resume, seeking, restart/replay, storage, bookmark/delete flows, chat retries and mobile navigation/zoom.

**Mocked API tests and the sample preview do not verify live provider access.** Before submitting, use your actual key to generate a fresh topic, play every chapter, seek both ways, ask a follow-up, reload, and replay. Check that the voice and diagrams match the explanation.

## Deploy on Vercel

1. Push this project to your own accessible GitHub repository.
2. Import the repository into Vercel. Select the Next.js framework preset.
3. Add `OPENAI_API_KEY` and any chosen model/limiter variables to the project's production environment. Do not upload `.env.local`.
4. Deploy with the default `npm run build` command.
5. Ensure deployment protection allows evaluators to access the production URL.
6. Configure shared Redis limits for a publicly promoted demo, then verify the complete learner flow on the production URL.

Alternatively, use `npx vercel` for project setup and `npx vercel --prod` to publish after configuring environment variables. The voice route uses the Node.js runtime and an **outbound** WebSocket connection; the browser receives a normal HTTP response containing WAV audio.

**Live demo:** deployment pending account connection. Replace this line with the verified production URL before submitting.

## Known limitations

- History, chat and audio are saved on the current browser/device, up to 30 lessons. There is no account sync or public lesson-sharing link. Clearing browser data removes the library.
- Teaching is currently English-first. Model output can be mistaken; structural validation is not a factual guarantee.
- The board supports controlled 2D primitives and plain/Unicode equations. It does not render arbitrary LaTeX, images or generated code.
- Visual timing is chapter-relative, not word-level alignment.
- The narration service uses a conversational voice model constrained to read the text; a transcript similarity check rejects major deviations but cannot prove verbatim equivalence.
- A first lesson waits for narration preparation. Failed narration can be retried, and completed clips are reused.
- Narration signatures expire after seven days; already cached audio remains playable. An uncached expired chapter needs a newly generated lesson.
- Shared rate limits require the optional Redis configuration described above.

## Assignment submission

Provide your GitHub URL and verified live URL in the [Braynix submission form](https://docs.google.com/forms/d/e/1FAIpQLSdFJoTxMEuFZrCHTbEgv7bbg2uLf33SjP7n0w2qUONR4kMRcA/viewform). Describe the tools honestly: AI coding assistance helped implement and review the application; OpenAI APIs provide runtime lessons, narration and answers; the preview lesson is prewritten.

The six sample narration files are bundled, so evaluation does not depend on the development computer. `scripts/generate-sample-audio.mjs` is an optional macOS-only maintainer utility for rebuilding that preview audio; it is never used at runtime.
