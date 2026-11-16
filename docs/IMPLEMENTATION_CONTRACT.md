# Implementation contract

Brand: Luma — a little clarity, on any topic. Native Next.js App Router, React JSX/JS, Tailwind CSS v4, shadcn/ui. Deep charcoal #111114, violet #a78bfa, off-white text. All authored UI styling via Tailwind, feature style.js exports. No fake live AI. An explicitly labelled prewritten sample is available for preview and tests.

## Lesson data

Lesson: { id, topic, title, summary, level: 'Beginner'|'Intermediate', createdAt (ISO), saved (boolean), source: 'ai'|'sample', scenes: Scene[], messages: Message[] }.
Scene: { id, title, narration, duration (estimated seconds initially, measured after audio), elements: Element[], speechToken? }.
Element: { id, type: 'text'|'rect'|'circle'|'line'|'arrow'|'equation', x, y, width, height, text, color: 'violet'|'cyan'|'amber'|'green'|'white'|'muted', appearAt (0..1), points: string }. Coordinates in 960x540 viewBox; x/y position, width/height dimensions, for line/arrow endpoint = x+width,y+height. circle x/y = center, width = diameter. All properties present even unused (empty string or 0). Text labels concise, no raw SVG/HTML/JS. Scene boards independent; derive state from time. At least 6 scenes, 240–290 words total, about 120 seconds.
Message: { id, role: 'user'|'assistant', content }.
Audio map: { [sceneId]: { blob: Blob, duration: number } }. Stored in IndexedDB alongside lessons. Client never stores API secrets.

## HTTP contracts

POST /api/lessons { topic, level } -> { lesson } (complete normalized Lesson incl signed scene speechToken).
POST /api/speech { text, token } -> { audio: base64 WAV, mimeType: 'audio/wav', duration, transcript }.
POST /api/chat { lesson: { title, summary, scenes: [{title,narration}] }, messages: [{role,content}] } -> { answer }.
GET /api/health -> { aiConfigured: boolean, textModel, speechModel } (no secrets).
Errors { error: { code, message } }, meaningful HTTP status. Browser's apiRequest helper returns parsed JSON or throws Error(message). AbortSignal supported.

## Provider (root agent owns)

src/features/library/LessonProvider.jsx exports LessonProvider and useLessons(). Context: { lessons, ready, storageError, saveLesson(lesson) => Promise, updateLesson(id,patch)=>Promise, deleteLesson(id)=>Promise, getLesson(id), getAudio(lessonId,sceneId)=>Promise<{blob,duration}|undefined>, saveAudio(lessonId,sceneId,audio)=>Promise, clearLibrary()=>Promise }. saveLesson upserts + updates context. New lessons start saved:false. Maximum 30 lessons, manual deletion only once limit reached.
src/lib/api.js exports apiRequest(url,body,{signal}={}).
src/lib/sample-lesson.js exports createSampleLesson() (new id per invocation), sampleTopic='Why do we have seasons?'. Sample has ~2min real locally generated static narration audio in public/sample/scene-N.wav; scene.sampleAudioUrl fields point to these files. Explicitly sample, not claimed AI.

## Ownership

Root: package/configs/globals.css/components/ui, lib except schema, LessonProvider, sample, all features/lesson, tests timeline + browser.
Backend agent: src/server/**, src/app/api/**, src/lib/lesson-schema.js, tests/server*.test.js, .env.example. Use model IDs from current official docs. Implement gpt-6-luna structured responses, gpt-realtime-2.1-mini via outbound Node websocket collected to WAV. Signed narration tokens, request limits, safe errors, validation, abort/timeouts, no logged secrets.
Frontend agent: src/app pages and layout (except globals.css/api), components/layout + shared, features/welcome, tutor, library except provider. Welcome on /; Explore /explore; library /history and /saved; active /lesson/[id]. Pages can server compose client feature. Wrap with LessonProvider then AppShell in layout. Lesson route imports LessonWorkspace from '@/features/lesson/LessonWorkspace'. TutorChat signature { lesson, onPause }, persists messages via provider. Welcome generation saves /api/lessons lesson then router.push. Preview sample saves createSampleLesson() then router.push. Main title style 'Make room for\nyour next big idea.' Voice disclosure via UI. Settings diagnostics modal optional, no dead controls. AppSidebar recent topics real history, no fake seeded counts.

## APIs and UI primitives

components/ui exports individual Button (variants default/secondary/ghost/outline, sizes default/sm/icon), Input, Textarea, Slider, Dialog family, Sheet family, Tooltip family. lib/utils exports cn. lucide-react for icons. Fonts system/locally bundled, avoid build-dependent font fetches.
