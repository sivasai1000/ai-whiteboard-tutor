import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { pcmToWav, narrationSimilarity } from "../src/server/audio.js";
import {
  generateRealtimeAudio,
  speechSessionEvent,
  speechResponseEvent,
} from "../src/server/speech-service.js";

class FakeSocket extends EventEmitter {
  sent = [];
  closed = false;
  send(value) {
    this.sent.push(JSON.parse(value));
  }
  terminate() {
    this.closed = true;
  }
  message(value) {
    this.emit("message", Buffer.from(JSON.stringify(value)));
  }
}

afterEach(() => vi.useRealTimers());

const narration = "Earth orbits the Sun once each year.";
function setup(options = {}) {
  const socket = new FakeSocket();
  const result = generateRealtimeAudio(narration, {
    apiKey: "test-key",
    model: "gpt-realtime-2.1-mini",
    socketFactory: () => socket,
    ...options,
  });
  return { socket, result };
}

describe("audio correctness", () => {
  it("writes a seekable PCM16 WAV header with measured duration", () => {
    const pcm = Buffer.alloc(48000);
    const wav = pcmToWav(pcm);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    expect(wav.readUInt32LE(24)).toBe(24000);
    expect(wav.readUInt32LE(40)).toBe(48000);
    expect(wav.length).toBe(48044);
    expect(() => pcmToWav(Buffer.alloc(3))).toThrow();
  });
  it("detects changed narration but tolerates punctuation", () => {
    expect(
      narrationSimilarity(narration, "Earth orbits the Sun, once each year!"),
    ).toBe(1);
    expect(
      narrationSimilarity(
        narration,
        "Let me explain why a different topic is interesting",
      ),
    ).toBeLessThan(0.5);
  });
  it("uses the current Realtime session fields and bounded output", () => {
    const session = speechSessionEvent("gpt-realtime-2.1-mini");
    expect(session.session.output_modalities).toEqual(["audio"]);
    expect(session.session.audio.output.format).toEqual({
      type: "audio/pcm",
      rate: 24000,
    });
    expect(session.session.audio.input.turn_detection).toBe(null);
    expect(session.session.max_output_tokens).toBe(1800);
    expect(speechResponseEvent(narration).response.conversation).toBe("none");
  });
  it("waits for session.updated before requesting speech, then collects audio", async () => {
    const { socket, result } = setup();
    socket.emit("open");
    expect(socket.sent.map((item) => item.type)).toEqual(["session.update"]);
    socket.message({ type: "session.updated" });
    socket.message({ type: "session.updated" });
    expect(socket.sent.map((item) => item.type)).toEqual([
      "session.update",
      "response.create",
    ]);
    socket.message({
      type: "response.output_audio.delta",
      delta: Buffer.alloc(48000).toString("base64"),
    });
    socket.message({
      type: "response.output_audio_transcript.done",
      transcript: narration,
    });
    socket.message({
      type: "response.done",
      response: { status: "completed" },
    });
    const audio = await result;
    expect(audio.duration).toBe(1);
    expect(audio.mimeType).toBe("audio/wav");
    expect(Buffer.from(audio.audio, "base64").toString("ascii", 0, 4)).toBe(
      "RIFF",
    );
    expect(socket.closed).toBe(true);
  });
  it("rejects hallucinated or rewritten narration", async () => {
    const { socket, result } = setup();
    socket.message({
      type: "response.output_audio.delta",
      delta: Buffer.alloc(48000).toString("base64"),
    });
    socket.message({
      type: "response.output_audio_transcript.done",
      transcript:
        "I cannot discuss that but let us talk about something unrelated.",
    });
    socket.message({
      type: "response.done",
      response: { status: "completed" },
    });
    await expect(result).rejects.toMatchObject({ code: "AUDIO_MISMATCH" });
  });
  it("rejects truncated responses and closes the connection", async () => {
    const { socket, result } = setup();
    socket.message({
      type: "response.done",
      response: { status: "incomplete" },
    });
    await expect(result).rejects.toMatchObject({ code: "AUDIO_INCOMPLETE" });
    expect(socket.closed).toBe(true);
  });
  it("aborts upstream work when the browser cancels", async () => {
    const controller = new AbortController();
    const { socket, result } = setup({ signal: controller.signal });
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: "AbortError" });
    expect(socket.closed).toBe(true);
  });
  it("caps generated PCM memory and billable duration", async () => {
    const { socket, result } = setup();
    socket.message({
      type: "response.output_audio.delta",
      delta: Buffer.alloc(24000 * 2 * 49).toString("base64"),
    });
    await expect(result).rejects.toMatchObject({ code: "AUDIO_TOO_LONG" });
    expect(socket.closed).toBe(true);
  });
  it("turns provider quota errors into safe user-facing errors", async () => {
    const { socket, result } = setup();
    socket.message({
      type: "error",
      error: { code: "insufficient_quota", message: "private raw error" },
    });
    await expect(result).rejects.toMatchObject({ code: "AI_QUOTA_EXCEEDED" });
  });
  it("times out an unresponsive voice service", async () => {
    vi.useFakeTimers();
    const { socket, result } = setup();
    const assertion = expect(result).rejects.toMatchObject({
      code: "AUDIO_TIMEOUT",
    });
    await vi.advanceTimersByTimeAsync(65001);
    await assertion;
    expect(socket.closed).toBe(true);
  });
});
