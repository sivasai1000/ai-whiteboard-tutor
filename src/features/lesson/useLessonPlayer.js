"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLessons } from "@/features/library/LessonProvider";
import { apiRequest } from "@/lib/api";
import { buildTimeline, resolvePlayback } from "./timeline";

function audioFromBase64(base64, mimeType) {
  const bytes = Uint8Array.from(atob(base64), (character) =>
    character.charCodeAt(0),
  );
  return new Blob([bytes], { type: mimeType });
}

function measureAudio(blob, signal) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const media = new Audio();
    const cleanup = () => {
      URL.revokeObjectURL(url);
      media.removeAttribute("src");
      signal.removeEventListener("abort", onAbort);
      clearTimeout(timer);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("This audio could not be loaded. Please try again."));
    }, 15000);
    media.onloadedmetadata = () => {
      const duration = media.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0)
        reject(new Error("The narration has an invalid duration."));
      else resolve(duration);
    };
    media.onerror = () => {
      cleanup();
      reject(new Error("This browser could not read the narration audio."));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    media.preload = "metadata";
    media.src = url;
    if (signal.aborted) onAbort();
  });
}

export function useLessonPlayer(lesson) {
  const { getAudio, saveAudio } = useLessons();
  const [durations, setDurations] = useState({});
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState("");
  const [speed, setSpeedState] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const audioRef = useRef(null);
  const tracksRef = useRef([]);
  const timelineRef = useRef([]);
  const indexRef = useRef(-1);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const seekingRef = useRef(false);
  const positionRef = useRef(0);
  const switchRef = useRef(null);
  const operationRef = useRef(0);

  const timeline = useMemo(
    () => buildTimeline(lesson.scenes, durations),
    [lesson.scenes, durations],
  );
  timelineRef.current = timeline;
  const total = timeline.at(-1)?.end || 0;

  const pause = useCallback(() => {
    playingRef.current = false;
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const switchTrack = useCallback((index, localTime, shouldPlay) => {
    const audio = audioRef.current;
    const track = tracksRef.current[index];
    if (!audio || !track) return;
    const operation = ++operationRef.current;
    audio.pause();
    indexRef.current = index;
    playingRef.current = shouldPlay;
    setPlaying(shouldPlay);
    const startPlayback = () => {
      if (operation !== operationRef.current) return;
      audio.currentTime = Math.max(
        0,
        Math.min(localTime, audio.duration || track.duration),
      );
      seekingRef.current = false;
      audio.playbackRate = speedRef.current;
      if (playingRef.current)
        audio.play().catch((failure) => {
          if (
            operation !== operationRef.current ||
            failure.name === "AbortError"
          )
            return;
          playingRef.current = false;
          setPlaying(false);
          setError("Audio playback was interrupted. Press Play to continue.");
        });
    };
    if (audio.src !== track.url || audio.readyState < 1) {
      seekingRef.current = true;
      audio.onloadedmetadata = startPlayback;
      if (audio.src !== track.url) {
        audio.src = track.url;
        audio.load();
      }
    } else startPlayback();
  }, []);
  switchRef.current = switchTrack;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const media = new Audio();
    media.preload = "auto";
    audioRef.current = media;
    const objectUrls = [];
    let frame;
    let failed = false;
    setLoading(true);
    setLoadedCount(0);
    setError("");
    setTime(0);
    setDurations({});
    setPlaying(false);
    playingRef.current = false;
    positionRef.current = 0;
    tracksRef.current = [];
    indexRef.current = -1;

    const updateClock = () => {
      if (!seekingRef.current && indexRef.current >= 0 && playingRef.current) {
        const segment = timelineRef.current[indexRef.current];
        if (segment) {
          positionRef.current = segment.start + media.currentTime;
          setTime(positionRef.current);
        }
      }
      frame = requestAnimationFrame(updateClock);
    };
    frame = requestAnimationFrame(updateClock);
    media.onended = () => {
      if (!playingRef.current || seekingRef.current) return;
      const nextIndex = indexRef.current + 1;
      if (nextIndex < tracksRef.current.length) {
        const nextTime = timelineRef.current[nextIndex].start;
        positionRef.current = nextTime;
        setTime(nextTime);
        switchRef.current(nextIndex, 0, true);
      } else {
        positionRef.current = timelineRef.current.at(-1).end;
        setTime(positionRef.current);
        playingRef.current = false;
        setPlaying(false);
      }
    };
    media.onerror = () => {
      if (!signal.aborted) {
        playingRef.current = false;
        setPlaying(false);
        setError("Narration could not play. Reload the audio to try again.");
      }
    };

    async function prepare() {
      const sceneDurations = {};
      let nextIndex = 0;
      // At most two paid speech requests at once. Each completed clip is cached immediately.
      async function worker() {
        while (nextIndex < lesson.scenes.length && !signal.aborted && !failed) {
          const index = nextIndex++;
          const scene = lesson.scenes[index];
          let stored = await getAudio(lesson.id, scene.id);
          signal.throwIfAborted();
          if (!stored) {
            if (lesson.source === "sample") {
              const response = await fetch(scene.sampleAudioUrl, { signal });
              if (!response.ok)
                throw new Error(
                  "The sample narration is unavailable. Please reload the page.",
                );
              const blob = await response.blob();
              stored = { blob, duration: await measureAudio(blob, signal) };
            } else {
              const payload = await apiRequest(
                "/api/speech",
                { text: scene.narration, token: scene.speechToken },
                { signal },
              );
              const blob = audioFromBase64(payload.audio, payload.mimeType);
              // Read actual media duration so all controls follow the real audio clock.
              stored = { blob, duration: await measureAudio(blob, signal) };
            }
            signal.throwIfAborted();
            await saveAudio(lesson.id, scene.id, stored);
          }
          signal.throwIfAborted();
          const url = URL.createObjectURL(stored.blob);
          objectUrls.push(url);
          tracksRef.current[index] = { url, duration: stored.duration };
          sceneDurations[scene.id] = stored.duration;
          setLoadedCount((count) => count + 1);
        }
      }
      try {
        await Promise.all([worker(), worker()]);
        signal.throwIfAborted();
        setDurations(sceneDurations);
        // Set the ref synchronously before initial media events can fire.
        timelineRef.current = buildTimeline(lesson.scenes, sceneDurations);
        setLoading(false);
        switchRef.current(0, 0, false);
      } catch (failure) {
        failed = true;
        if (!signal.aborted) {
          setError(
            failure.message ||
              "The voice could not be prepared. Please try again.",
          );
          setLoading(false);
        }
      }
    }
    prepare();
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      operationRef.current++;
      media.onended = null;
      media.onerror = null;
      media.onloadedmetadata = null;
      media.pause();
      media.removeAttribute("src");
      media.load();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      if (audioRef.current === media) audioRef.current = null;
      playingRef.current = false;
    };
    // A bookmark or chat update does not restart playback. Lesson content is immutable.
  }, [lesson.id, attempt, getAudio, saveAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  const seek = useCallback(
    (value) => {
      if (
        loading ||
        tracksRef.current.filter(Boolean).length !== lesson.scenes.length
      )
        return;
      const state = resolvePlayback(timelineRef.current, value);
      if (!state) return;
      positionRef.current = state.time;
      setTime(state.time);
      switchTrack(
        state.index,
        state.localTime,
        playingRef.current && state.time < state.total,
      );
    },
    [loading, lesson.scenes.length, switchTrack],
  );

  const play = useCallback(() => {
    if (
      loading ||
      tracksRef.current.filter(Boolean).length !== lesson.scenes.length
    )
      return;
    setError("");
    const position =
      positionRef.current >= timelineRef.current.at(-1).end - 0.05
        ? 0
        : positionRef.current;
    const state = resolvePlayback(timelineRef.current, position);
    positionRef.current = position;
    setTime(position);
    switchTrack(state.index, state.localTime, true);
  }, [loading, lesson.scenes.length, switchTrack]);

  const restart = useCallback(() => {
    pause();
    seek(0);
  }, [pause, seek]);
  const setSpeed = useCallback((value) => {
    speedRef.current = value;
    setSpeedState(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  }, []);

  return {
    time,
    total,
    timeline,
    state: resolvePlayback(timeline, time),
    playing,
    loading,
    loadedCount,
    error,
    speed,
    ready: !loading && loadedCount === lesson.scenes.length,
    play,
    pause,
    seek,
    restart,
    setSpeed,
    retry: () => setAttempt((value) => value + 1),
  };
}
