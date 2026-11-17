import "server-only";
import WebSocket from "ws";
import { getApiKey, getModels } from "./config.js";
import { AppError } from "./errors.js";
import { verifyNarration } from "./speech-tokens.js";
import { pcmToWav, narrationSimilarity, joinNarrationClips } from "./audio.js";
import { addWordTimings } from "./word-alignment.js";
import { SPEECH_PROMPT } from "./prompts.js";

const cacheKey = Symbol.for("braynix.narration-cache");
const cache = (globalThis[cacheKey] ||= new Map());
const SAMPLE_RATE = 24000;
const MAX_PCM_BYTES = SAMPLE_RATE * 2 * 48;
const CACHE_BYTE_LIMIT = 20 * 1024 * 1024;

export function speechSessionEvent(model, voice = "marin") {
  return {
    type: "session.update",
    session: {
      type: "realtime",
      model,
      output_modalities: ["audio"],
      instructions: SPEECH_PROMPT,
      max_output_tokens: 1800,
      reasoning: { effort: "minimal" },
      audio: {
        input: { turn_detection: null },
        output: { format: { type: "audio/pcm", rate: SAMPLE_RATE }, voice },
      },
    },
  };
}

export function speechResponseEvent(text) {
  return {
    type: "response.create",
    response: {
      conversation: "none",
      output_modalities: ["audio"],
      max_output_tokens: 1800,
      input: [
        {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Read this passage verbatim:\n<passage>\n${text}\n</passage>`,
            },
          ],
        },
      ],
    },
  };
}

export function generateRealtimeAudio(
  text,
  {
    signal,
    apiKey,
    model,
    voice = "marin",
    socketFactory,
    segments = [text],
  } = {},
) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
    const createSocket =
      socketFactory || ((url, options) => new WebSocket(url, options));
    const socket = createSocket(
      `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        handshakeTimeout: 12_000,
        maxPayload: 8 * 1024 * 1024,
      },
    );
    let finished = false,
      requested = false,
      bytes = 0,
      transcript = "";
    const chunks = [];
    const clips = [];
    let segmentIndex = 0;
    const transcripts = [];
    const finish = (error, result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      // Keep the error listener until close: terminate during CONNECTING emits it.
      socket.terminate();
      if (error) reject(error);
      else resolve(result);
    };
    const abort = () => finish(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(
      () =>
        finish(
          new AppError(
            "AUDIO_TIMEOUT",
            "Narration took too long to prepare. Please try again.",
            504,
          ),
        ),
      65_000,
    );
    signal?.addEventListener("abort", abort, { once: true });
    socket.on("open", () =>
      socket.send(JSON.stringify(speechSessionEvent(model, voice))),
    );
    socket.on("error", () =>
      finish(
        new AppError(
          "AUDIO_CONNECTION",
          "The voice service couldn't connect. Please try again.",
          502,
        ),
      ),
    );
    socket.on("unexpected-response", (_request, response) => {
      response.resume();
      finish(
        new AppError(
          response.statusCode === 429 ? "AI_BUSY" : "AUDIO_CONFIGURATION",
          response.statusCode === 429
            ? "The voice service is busy. Please try again shortly."
            : "The tutor's voice connection needs attention. Please contact the app owner.",
          response.statusCode === 429 ? 429 : 503,
        ),
      );
    });
    socket.on("close", () => {
      if (!finished)
        finish(
          new AppError(
            "AUDIO_INTERRUPTED",
            "The narration connection closed early. Please try again.",
            502,
          ),
        );
    });
    socket.on("message", (raw) => {
      if (finished) return;
      let event;
      try {
        event = JSON.parse(raw.toString());
      } catch {
        return finish(
          new AppError(
            "AUDIO_INVALID",
            "The voice service returned an invalid response.",
            502,
          ),
        );
      }
      if (event.type === "session.updated" && !requested) {
        requested = true;
        socket.send(
          JSON.stringify(speechResponseEvent(segments[segmentIndex])),
        );
      } else if (event.type === "response.output_audio.delta") {
        const chunk = Buffer.from(event.delta || "", "base64");
        bytes += chunk.length;
        if (bytes > MAX_PCM_BYTES)
          return finish(
            new AppError(
              "AUDIO_TOO_LONG",
              "The narration exceeded the lesson segment limit. Please try again.",
              502,
            ),
          );
        chunks.push(chunk);
      } else if (event.type === "response.output_audio_transcript.delta") {
        transcript += event.delta || "";
        if (transcript.length > 4000)
          return finish(
            new AppError(
              "AUDIO_INVALID",
              "The narration didn't match the lesson.",
              502,
            ),
          );
      } else if (event.type === "response.output_audio_transcript.done") {
        transcript = event.transcript || transcript;
        if (transcript.length > 4000)
          return finish(
            new AppError(
              "AUDIO_INVALID",
              "The narration didn't match the lesson.",
              502,
            ),
          );
      } else if (event.type === "error") {
        const code = event.error?.code;
        finish(
          new AppError(
            code === "insufficient_quota"
              ? "AI_QUOTA_EXCEEDED"
              : "AUDIO_UNAVAILABLE",
            code === "insufficient_quota"
              ? "The tutor's AI credits are unavailable. Please contact the app owner."
              : "The voice service couldn't prepare this narration. Please try again.",
            503,
          ),
        );
      } else if (event.type === "response.done") {
        if (event.response?.status !== "completed" || !bytes)
          return finish(
            new AppError(
              "AUDIO_INCOMPLETE",
              "The narration wasn't fully generated. Please try again.",
              502,
            ),
          );
        if (narrationSimilarity(segments[segmentIndex], transcript) < 0.8)
          return finish(
            new AppError(
              "AUDIO_MISMATCH",
              "The voice didn't follow the lesson closely enough. Please retry narration.",
              502,
            ),
          );
        try {
          const pcm = Buffer.concat(chunks);
          if (pcm.length < SAMPLE_RATE / 2 || pcm.length % 2)
            throw new Error("Empty audio");
          clips.push({ pcm, text: segments[segmentIndex] });
          transcripts.push(transcript);
          segmentIndex++;
          if (segmentIndex < segments.length) {
            chunks.length = 0;
            transcript = "";
            socket.send(
              JSON.stringify(speechResponseEvent(segments[segmentIndex])),
            );
            return;
          }
          const joined = joinNarrationClips(clips);
          finish(null, {
            audio: pcmToWav(joined.pcm).toString("base64"),
            mimeType: "audio/wav",
            duration: joined.duration,
            cues: joined.cues,
            transcript: transcripts.join(" "),
          });
        } catch {
          finish(
            new AppError(
              "AUDIO_INVALID",
              "The narration could not be played. Please try again.",
              502,
            ),
          );
        }
      }
    });
  });
}

export async function generateSpeech(
  { text, token, segments },
  { signal } = {},
) {
  const apiKey = getApiKey();
  const hash = verifyNarration(text, token);
  if (segments && segments.join(" ") !== text) {
    throw new AppError(
      "NARRATION_SEGMENTS",
      "The narration steps do not match this lesson.",
      400,
    );
  }
  const model = getModels().speechModel;
  const voice = process.env.OPENAI_VOICE || "marin";
  const key = `timed-v3:${model}:${voice}:${hash}:${JSON.stringify(segments || [text])}`;
  const existing = cache.get(key);
  if (existing && existing.expires > Date.now()) return existing.result;
  const recording = await generateRealtimeAudio(text, {
    apiKey,
    model,
    voice,
    signal,
    segments,
  });
  const result = await addWordTimings(recording, { signal });
  for (const [id, entry] of cache)
    if (entry.expires <= Date.now()) cache.delete(id);
  let size = [...cache.values()].reduce(
    (total, entry) => total + entry.result.audio.length,
    0,
  );
  while (cache.size && size + result.audio.length > CACHE_BYTE_LIMIT) {
    const oldest = cache.keys().next().value;
    size -= cache.get(oldest).result.audio.length;
    cache.delete(oldest);
  }
  cache.set(key, { result, expires: Date.now() + 30 * 60_000 });
  return result;
}
