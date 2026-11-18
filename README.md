# Braynix — AI Interactive Whiteboard Tutor

A focused learning space: enter a topic, generate a short lesson, and listen while an interactive whiteboard explains it step by step. Built for the Braynix Studios AI Whiteboard Tutor assignment.

**Live demo:** [ai-whiteboard-tutor-amber.vercel.app](https://ai-whiteboard-tutor-amber.vercel.app) · **Source:** [sivasai1000/ai-whiteboard-tutor](https://github.com/sivasai1000/ai-whiteboard-tutor)

Brand assets are copied unchanged from [Braynix Studios](https://braynix.in/): the [192px brand mark](https://braynix.in/android-chrome-192x192.png), [favicon](https://braynix.in/favicon.ico), [32px icon](https://braynix.in/favicon-32x32.png), and [Apple touch icon](https://braynix.in/apple-touch-icon.png). They are served locally; rendering the app does not depend on the company website.

## Run locally

Prerequisites: Node.js 24.x, npm, and an OpenAI API account with credits and access to the configured models.

```bash
npm ci
cp .env.example .env.local
```

Set `OPENAI_API_KEY` in `.env.local`, then run:

```bash
npm run dev
```

Open **http://127.0.0.1:3000**. New AI lessons and follow-up answers require the API key. The **Play preview** sample about Moon phases works immediately without credentials and is explicitly labelled as a sample. It is not presented as live AI output.

## What works

- Prominent **AI Chat** and **Whiteboard** tabs below the sidebar logo. Chat has its own History and Saved Chats; Whiteboard has Explore, History and Saved Lessons. The mobile menu uses the same navigation.
- Chat-first topic input with Beginner and Intermediate teaching levels.
- Real structured AI lessons for arbitrary educational topics, targeting approximately two minutes.
- Seven deterministic diagram layouts: arrays, processes, cycles, comparisons, bar charts, concept maps and equation steps, with curated symbols and synchronized highlights.
- Generated spoken narration, with the audio clock driving the visual timeline.
- Play, pause, resume, seek, restart, replay, playback speed and chapter navigation.
- Whiteboard zoom and scrolling for small screens.
- AI follow-up chat that receives the current lesson as context.
- A dedicated Claude-inspired **AI chat** at `/ai`, with new conversations, searchable history, persistent bookmarks, Markdown/code responses, copy, stop, retry, regeneration and confirmed deletion.
- Real Server-Sent Events (SSE) using the Vercel AI SDK; answers appear incrementally as they are generated.
- Explore topics, lesson history, bookmarks and confirmed deletion.
- Local persistence of lesson data, chat and narration in IndexedDB.
- Responsive neutral UI with compact mobile composers using Tailwind CSS, feature-level `style.js` files and shadcn/ui.
- Loading, error and retry states; keyboard controls and accessible input labels.

## Stack

| Concern             | Implementation                                                        |
| ------------------- | --------------------------------------------------------------------- |
| Framework           | Next.js App Router + React                                            |
| Language            | JavaScript (`.jsx` components, `.js` logic)                           |
| Styling             | Tailwind CSS v4 + shadcn/ui + native system typography                |
| AI lessons and chat | OpenAI Responses API, configurable `gpt-6-luna` default               |
| Conversation SDK    | Vercel AI SDK 7, `@ai-sdk/react` and `@ai-sdk/openai`                 |
| Conversation UI     | Current shadcn AI Elements + Streamdown for streaming Markdown        |
| Narration           | OpenAI Realtime API, configurable `gpt-realtime-2.1-mini` default     |
| Graphics            | React-rendered SVG; the model returns data, never executable graphics |
| Playback            | HTMLAudioElement + deterministic timeline functions                   |
| Local storage       | IndexedDB through `idb`                                               |
| Validation          | Zod                                                                   |

Model IDs are configurable. Availability depends on the OpenAI account. The older Speech API models are not used by default. See the official [model catalogue](https://developers.openai.com/api/docs/models) and [deprecation schedule](https://developers.openai.com/api/docs/deprecations).

## Folder structure

```text
src/
  app/                       Pages, layouts and thin API route handlers
    api/lessons/             Generate a validated lesson
    api/speech/              Generate signed narration as WAV
    api/chat/                Answer a lesson-related question
    api/conversations/       Stream a text conversation over SSE
    api/health/              Configuration status, never credentials
    explore/                 Topic discovery
    history/                 Lessons on this device
    saved/                   Bookmarked lessons
    ai/                      User-facing AI conversation workspace
    lesson/[id]/             Interactive teaching workspace
    globals.css              Tailwind imports and shared theme tokens
  components/
    ui/                      shadcn/ui building blocks
    layout/                  Shared sidebar, shell and mobile navigation
    composer/                Shared responsive input styles
    shared/                  Reusable loading/error/empty-state UI
  features/
    welcome/                 Topic input and discovery
    lesson/                  Whiteboard, timeline, player and playback hook
    tutor/                   Follow-up conversation
    library/                 Lesson provider and library screens
    ai/                      Conversation UI, history, persistence and chat hook
  server/                    OpenAI services, prompts, signing and request limits
  lib/                       Validation, browser storage and shared utilities
public/sample/               Bundled narration for the disclosed preview
docs/architecture.md         Data flow and interview walkthrough
```

Pages compose feature components. Components render the interface. Hooks own browser behavior. Services handle provider calls. API routes validate requests and delegate to services. Feature `style.js` files hold reusable Tailwind class strings; small one-off utilities can remain beside JSX. `globals.css` contains framework/theme setup rather than page-specific CSS.

## How synchronization works

1. The AI plans six chapters with exactly three short teaching steps each, targeting 270–310 spoken words. Each step contains narration, a visual note, label/value updates and one state per visible object. `lesson-plan.js` compiles those states into the existing visible/highlighted/dimmed playback lists; a highlighted object cannot accidentally be hidden. Older saved lessons with up to five steps per chapter remain supported.
2. The backend validates node references, layout capacity, narration length and simulation constraints. An independent bounded call checks factual and narration/diagram consistency; it can correct narration when the diagram is already correct. If structure or review fails, the service requests one corrected plan with concrete feedback, then validates and reviews it again. A second invalid attempt returns an error. Only a passing result receives signed narration. React chooses the coordinates; the model never writes executable graphics.
3. The browser requests missing audio chapters, at most two concurrently. The server checks that the phrases concatenate to the signed passage before opening a Realtime voice session.
4. Each phrase is recorded separately in that session. The server checks its transcript, trims near-silent edges, adds a short pause, and joins the PCM clips into a WAV. Sample counts provide **measured start/end times for each phrase**.
5. A bounded transcription call obtains word timestamps for the finished chapter. The server aligns those positions with the authored text, preserving its spelling and punctuation. The browser validates and caches the audio, phrase cues and word timings.
6. The media clock selects the chapter, phrase, diagram state and subtitle prefix. Subtitles accumulate only the words already reached: “The” → “The Moon” → “The Moon reflects.” Each phrase starts a fresh line. Seeking rebuilds that prefix and visual state, including reversing prior changes. Pause, speed changes, restart and replay use the same clock and need no further provider requests.

Whiteboard actions still synchronize at **recorded phrase boundaries**. Subtitles now reveal words progressively using timestamps obtained from the audio, without highlighting or a separate typing timer. Their layout reserves space for the phrase to prevent the controls jumping as text grows. Transcription timestamps are model estimates, not guaranteed exact phonetic boundaries. Small unmatched spans can be interpolated between audio anchors and are marked `estimated` in the data.

If word alignment fails or older cached AI audio has no word timings, the recording remains playable with an explicitly estimated timing fallback. The app does not silently regenerate a paid recording. Existing saved Moon previews fetch the enriched cue metadata once and retain their original audio; failed metadata upgrades can recover on a later online visit. A transcript similarity check catches large narration deviations, but cannot prove perfect speech or factual correctness.

**Word-timestamp provider:** `src/server/word-alignment.js` currently uses `whisper-1` with `verbose_json` and word timestamps because those are supported by the existing OpenAI account/API. OpenAI has [announced its retirement for February 26, 2027](https://developers.openai.com/api/docs/guides/speech-to-text#timestamps); the current `gpt-transcribe` workflow has no documented drop-in word-timestamp replacement. Replace this isolated adapter with a verified timestamp/alignment provider before that date for continued aligned subtitles on newly generated audio. Bundled and cached timings remain usable. There is one bounded extra transcription request per new chapter, no automatic retry, and no extra API key.

The Moon-phases preview uses a calculated orbital diagram alongside a textured view from Earth. Its 18 measured cues and fresh AI voice recording ship with the application, so playing it uses no API credits. It runs about **1 minute 51 seconds at 1×**. Previously saved binary-search previews retain their 1.25× default; all new lessons start at 1×. Both can be adjusted using the player.

For Moon-phase topics, the model can select the `moon-phases` scene. A shared contract controls its four objects and bounded phase transitions. Code calculates the orbital position and projected illuminated shape, rather than asking an image model to invent geometry. Transitions use progress within the measured spoken phrase, settle before it ends, and reconstruct on seek. Reduced-motion mode displays the destination state without orbital animation. The seven general diagram layouts remain available for other topics; photorealistic simulations are not claimed for arbitrary subjects.

The astronomy model omits eclipses, inclination, libration and real scale; its Earth-view orientation follows the Northern Hemisphere convention. The phase cycle is distinct from the Moon's sidereal orbital period. See [astronomy sources and asset credits](docs/astronomy.md) for the formulas, assumptions and NASA image provenance.

Captions and controls remain inside the whiteboard in normal and fullscreen modes. Native fullscreen is preferred; unsupported browsers use an expanded view with focus containment and Escape to close. Compact diagrams reflow on smaller screens, and zoom lets learners inspect the drawing.

Previously saved lessons retain their original primitive diagrams and estimated timing. Create a new lesson to use the new visual format. Old cached audio is never assigned invented phrase timings.

The lesson input uses the [AI Elements Model Selector pattern](https://ui.shadcn.com/docs/ai-elements/radix/model-selector) with shadcn Input Group and radio menus. It displays the server-configured model beside a compact settings menu containing Low, Medium or High reasoning effort and the lesson level. On mobile, the two-line input and one-row toolbar fit a 320px viewport; settings use an icon button and menus stay within the viewport. Low is the default. The selected effort reaches the OpenAI Responses request and is stored with the generated lesson. Only the configured model is allowed; changing the client request cannot select an unapproved model. The shared model menu also shows locked alternatives. Choosing a locked row opens a contact dialog for Sivasai at `sivasaimallipudi9h@gmail.com`; it does not select that model or send a provider request. The email action opens the user’s mail app with the requested model named in the draft. Higher effort may increase latency and cost, while the output-token limit remains bounded.

See [architecture.md](docs/architecture.md) for the full flow and implementation walkthrough.

## AI conversation module

Open `/ai` or choose **AI chat** in the sidebar. This is a user-facing conversation workspace. The visual direction is inspired by Claude; responses use your configured OpenAI model and the same server-only `OPENAI_API_KEY` as the tutor. No separate Vercel AI Gateway account is required.

The UI follows the current [shadcn AI Elements Chat](https://ui.shadcn.com/docs/ai-elements/base/chat) composition: Message Scroller, Message, Bubble and Input Group. These source components were installed through the shadcn CLI and adapted to the app's existing JavaScript/Tailwind theme. Feature styles remain in `src/features/ai/style.js`.

1. `useChat` sends text-only conversation context through `DefaultChatTransport` to `/api/conversations`.
2. The route validates the body and applies the existing origin checks, signed session cookie, request bounds and chat quotas.
3. `streamConversation` calls `streamText` through the OpenAI provider. `toUIMessageStream` and `createUIMessageStreamResponse` return SSE events as generation proceeds; there is no artificial typing timer.
4. Streamdown renders partial Markdown and code. The message scroller follows new output while allowing the user to read earlier messages.
5. Stop aborts the browser request; the server forwards cancellation to the provider. Switching conversations also stops the old request. Retry/regenerate replaces the last answer without duplicating the question.
6. Questions are saved before paid generation. Replies are checkpointed in IndexedDB every 500 ms while streaming, then saved again on completion or when switching screens. Refreshing restores the last saved partial answer; it does not restart a paid request automatically. Use Regenerate to request a complete answer after an interrupted stream.

Up to **40 conversations** with **80 messages each** are saved on the current device. Only the latest 24 text messages, bounded to 48,000 characters, are sent as context. Each user message is limited to 4,000 characters. Old context can fall outside this window. Clearing browser data removes the chats. There is no server-side conversation sync, file upload, web browsing or tool execution in this module.

The AI Chat composer reuses the whiteboard's model and effort menus. It shows the server-configured model and defaults each opened chat session to Low effort. Low, Medium and High are sent with every message, follow-up and retry; controls are disabled while a response is running. The selection stays in the active session and resets to Low when reopening or reloading a chat. Completion budgets, including reasoning, are capped at 3,000 / 5,000 / 8,000 tokens respectively. These caps leave room for reasoning while the prompt asks for concise answers. Higher effort can cost more and take longer. The server rejects models other than its configured model before starting the provider stream.

The original lesson-specific follow-up endpoint remains separate from the general conversation workspace. Both share `DAILY_CHAT_LIMIT`, so adding the chat page does not introduce a second independent spending allowance.

Use `/ai?view=history` to search chat titles and messages, and `/ai?view=saved` for bookmarked conversations. Saving a chat updates the existing IndexedDB record and remains intact while responses stream. Lesson bookmarks remain in the separate lesson database. The sidebar shows the latest ten chats; the History view includes all conversations retained on this device.

## Browser database names

- `braynix-lessons`: `lessons`, `audio`, and migration bookkeeping.
- `braynix-conversations`: `conversations` and migration bookkeeping.

The stores use descriptive fields such as `id`, `title`, `scenes`, `messages`, `blob`, and `duration`. Session cookies, cache identifiers, request-limit keys, metadata, and tutor prompts use the Braynix name.

On browsers supporting [IndexedDB database discovery](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases), the app automatically imports a matching previous-version library on the same origin. It copies records and audio Blobs in one transaction, preserves existing destination records, and removes the old database only after committing the copy. If storage is full, the original remains untouched. Close older app tabs to allow database cleanup to finish. Original narration permissions retain their signed content and expiry during migration; this does not use AI credits. Clearing browser storage still deletes local history.

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

- A valid first attempt uses one generation call and one accuracy review with the configured low-cost text model. An invalid plan or rejected review allows one correction attempt: at most two generation calls and two reviews per request. Shared diagrams are deduplicated in review input. This adds latency and API usage; it is not a free or externally sourced fact-check. Automatic SDK transport retries remain disabled; billing, authentication, network and cancellation errors are not retried.
- Lesson planning and repair share a 170-second deadline inside a 180-second route limit. Each provider request retains its 75-second timeout. Other JSON API handlers keep their existing 85-second deadline. Cancelling the browser request cancels work on the server.
- A small model is used for lesson data and chat; narration is generated once and cached.
- The browser caches each completed audio chapter, including before a later chapter fails.
- Replaying, seeking and restarting do not generate new AI content.
- The narration endpoint requires a signed passage generated by the lesson service.
- Requests have body-size bounds, timeouts, origin checks, and global/IP/session quotas.
- Shared Redis limits check and increment all buckets atomically. Denied visitors do not consume another visitor's global allowance.

**Without Redis, limits and the short-lived server audio cache are per-process.** Serverless restarts or multiple instances reset/partition them. Configure Redis for durable shared limits before exposing the API to broad traffic. These request quotas are not a guaranteed dollar spending cap; monitor the provider's billing dashboard and account controls.

## Build and manual verification

```bash
npm run build
npm start
```

This repository does not include an automated test suite. Verify the main flows manually after changes:

1. Open the sample lesson and check play, pause, speed, seek, restart and fullscreen. Confirm subtitles and drawings follow the narration.
2. Save a lesson, reload it, replay the cached audio, and check History and Saved Lessons.
3. In AI Chat, send a question, stop a response, ask a follow-up, reload, and check saved conversations.
4. Check desktop and mobile navigation, model/effort menus and the sidebar contact link.
5. With a configured API key, generate a fresh lesson, play every chapter and ask a tutor follow-up. These provider requests use API credits; the bundled sample does not.

The sample preview does not verify live provider access. Repeat the real lesson and chat flows after changing credentials, models or hosting configuration.

## Deploy on Vercel

Automatic Git deployments are disabled in `vercel.json` (`git.deploymentEnabled: false`). Pushing commits updates GitHub only. Publish manually when deployment is approved, or explicitly enable automatic deployments in that configuration.

1. Push this project to your own accessible GitHub repository.
2. Import the repository into Vercel. Select the Next.js framework preset.
3. Add `OPENAI_API_KEY` and any chosen model/limiter variables to the project's production environment. Do not upload `.env.local`.
4. Deploy with the default `npm run build` command.
5. Ensure deployment protection allows evaluators to access the production URL.
6. Configure shared Redis limits for a publicly promoted demo, then verify the complete learner flow on the production URL.

Alternatively, use `npx vercel` for project setup and `npx vercel --prod` to publish after configuring environment variables. The voice route uses the Node.js runtime and an **outbound** WebSocket connection; the browser receives a normal HTTP response containing WAV audio.

The existing demo URL is [ai-whiteboard-tutor-amber.vercel.app](https://ai-whiteboard-tutor-amber.vercel.app). It may run an earlier revision until the next approved deployment. Keep credentials in server-side environment variables and verify public access after publishing.

## Known limitations

- History, chat and audio are saved on the current browser/device, up to 30 lessons. There is no account sync or public lesson-sharing link. Clearing browser data removes the library.
- Teaching is currently English-first. Model output can be mistaken; structural validation and a second model review are not a factual guarantee.
- The board uses seven controlled 2D layouts, curated symbols and plain/Unicode equations. It does not create arbitrary illustrations, LaTeX, 3D scenes or executable graphics.
- Diagrams use measured phrase boundaries; progressive subtitles use audio-derived word timings when available. Legacy cached audio and alignment failures use marked estimates. This is not guaranteed phoneme-accurate forced alignment.
- The narration service uses a conversational voice model constrained to read the text; a transcript similarity check rejects major deviations but cannot prove verbatim equivalence.
- A first lesson waits for narration preparation. Failed narration can be retried, and completed clips are reused.
- Narration signatures expire after seven days; already cached audio remains playable. An uncached expired chapter needs a newly generated lesson.
- Shared rate limits require the optional Redis configuration described above.

## Assignment submission

Provide your GitHub URL and verified live URL in the [Braynix submission form](https://docs.google.com/forms/d/e/1FAIpQLSdFJoTxMEuFZrCHTbEgv7bbg2uLf33SjP7n0w2qUONR4kMRcA/viewform). Describe the tools honestly: AI coding assistance helped implement and review the application; OpenAI APIs provide runtime lessons, narration and answers; the preview lesson is prewritten.

The current preview has six bundled AAC clips, WAV compatibility fallbacks and six JSON cue tables in `public/sample/moon-phases-v1/`. They are loaded concurrently and cached in IndexedDB. Earlier `binary-search-v1/`, `binary-search-v2/` and `public/sample/scene-N.wav` assets remain for previously saved lessons: changing those URLs would pair old lesson data with different narration. NASA imagery is bundled in `public/visuals/astronomy/`; playback needs no external image host.

`scripts/generate-sample-audio.mjs` is a macOS-only maintainer utility. For the current AI voice, run `node --env-file=.env.local --conditions=react-server scripts/generate-sample-audio.mjs --ai` (uses provider credits). It checks transcript similarity, records each phrase, joins clips and writes measured cues. `--local` explicitly selects an offline Samantha recording instead. To add word timings to existing sample recordings without changing any audio, run `node --env-file=.env.local --conditions=react-server scripts/generate-sample-audio.mjs --align-only`; already aligned chapters are skipped. Never overwrite a released sample version after changing its narration; use new scene IDs and a new asset directory. The script is never used at runtime.
