"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLessons } from "@/features/library/LessonProvider";
import { loadChapterAudio } from "./audio-loader";
import { buildTimeline, resolvePlayback } from "./timeline";

export function useLessonPlayer(lesson) {
  const { getAudio, saveAudio } = useLessons();
  const initialSpeed =
    lesson.source === "sample" && (lesson.formatVersion || 1) < 3 ? 1.25 : 1;
  const [durations, setDurations] = useState({});
  const [timings, setTimings] = useState({});
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [speed, setSpeedState] = useState(initialSpeed);
  const [attempt, setAttempt] = useState(0);
  const audioRef = useRef(null);
  const tracksRef = useRef([]);
  const timelineRef = useRef([]);
  const indexRef = useRef(-1);
  const playingRef = useRef(false);
  const speedRef = useRef(initialSpeed);
  const seekingRef = useRef(false);
  const positionRef = useRef(0);
  const localPositionRef = useRef(0);
  const switchRef = useRef(null);
  const operationRef = useRef(0);
  const invalidAudioRef = useRef(new Set());
  const resumeRef = useRef(null);
  const playbackOnlyRef = useRef(false);
  const failuresRef = useRef(new Map());

  const timeline = useMemo(
    () => buildTimeline(lesson.scenes, durations, timings),
    [lesson.scenes, durations, timings],
  );
  timelineRef.current = timeline;
  const total = timeline.at(-1)?.end || 0;

  const pause = useCallback(() => {
    playingRef.current = false;
    audioRef.current?.pause();
    setPlaying(false);
    setBuffering(false);
  }, []);

  const switchTrack = useCallback((index, localTime, shouldPlay) => {
    const audio = audioRef.current;
    if (!audio) return;
    const operation = ++operationRef.current;
    audio.onloadedmetadata = null;
    audio.pause();
    indexRef.current = index;
    localPositionRef.current = localTime;
    playingRef.current = shouldPlay;
    setPlaying(shouldPlay);
    const track = tracksRef.current[index];
    seekingRef.current = true;
    if (!track) {
      const failure = failuresRef.current.get(index);
      setBuffering(!failure);
      if (failure) {
        playingRef.current = false;
        setPlaying(false);
        setError(failure);
      }
      return; // The loader resumes this exact chapter when it becomes available.
    }
    const startPlayback = () => {
      if (operation !== operationRef.current) return;
      audio.onloadedmetadata = null;
      audio.currentTime = Math.max(
        0,
        Math.min(localTime, audio.duration || track.duration),
      );
      localPositionRef.current = audio.currentTime;
      positionRef.current =
        timelineRef.current[index].start + audio.currentTime;
      setTime(positionRef.current);
      seekingRef.current = false;
      audio.playbackRate = speedRef.current;
      setBuffering(false);
      if (playingRef.current) {
        audio.play().catch((failure) => {
          if (
            operation !== operationRef.current ||
            failure.name === "AbortError"
          )
            return;
          playingRef.current = false;
          setPlaying(false);
          setBuffering(false);
          playbackOnlyRef.current = true;
          setError(
            failure.name === "NotAllowedError"
              ? "Your browser paused audio. Press Play to start the narration."
              : "Audio playback was interrupted. Press Play to continue.",
          );
        });
      }
    };
    if (audio.src !== track.url || audio.readyState < 1 || audio.error) {
      setBuffering(shouldPlay);
      audio.onloadedmetadata = startPlayback;
      audio.src = track.url;
      audio.load();
    } else startPlayback();
  }, []);
  switchRef.current = switchTrack;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const media = new Audio();
    media.preload = "auto";
    media.preservesPitch = true;
    audioRef.current = media;
    const objectUrls = [];
    const sceneDurations = {};
    const sceneTimings = {};
    const resume = resumeRef.current;
    resumeRef.current = null;
    let frame;
    setPreparing(true);
    setBuffering(false);
    setLoadedCount(0);
    setReady(false);
    setError("");
    setDurations({});
    setTimings({});
    setPlaying(false);
    playingRef.current = false;
    seekingRef.current = false;
    playbackOnlyRef.current = false;
    failuresRef.current = new Map();
    tracksRef.current = Array(lesson.scenes.length).fill(null);
    indexRef.current = resume?.index ?? -1;
    localPositionRef.current = resume?.localTime || 0;
    timelineRef.current = buildTimeline(lesson.scenes);
    positionRef.current = resume
      ? timelineRef.current[resume.index].start + resume.localTime
      : 0;
    setTime(positionRef.current);

    const updateClock = () => {
      if (!seekingRef.current && indexRef.current >= 0 && playingRef.current) {
        const segment = timelineRef.current[indexRef.current];
        if (segment) {
          localPositionRef.current = media.currentTime;
          positionRef.current = segment.start + media.currentTime;
          setTime(positionRef.current);
        }
      }
      frame = requestAnimationFrame(updateClock);
    };
    frame = requestAnimationFrame(updateClock);
    media.onwaiting = () => {
      if (playingRef.current) setBuffering(true);
    };
    media.onplaying = () => setBuffering(false);
    media.onended = () => {
      if (!playingRef.current || seekingRef.current) return;
      const nextIndex = indexRef.current + 1;
      if (nextIndex < lesson.scenes.length) {
        positionRef.current = timelineRef.current[nextIndex].start;
        setTime(positionRef.current);
        switchRef.current(nextIndex, 0, true);
      } else {
        positionRef.current = timelineRef.current.at(-1).end;
        setTime(positionRef.current);
        playingRef.current = false;
        setPlaying(false);
        setBuffering(false);
      }
    };
    media.onerror = () => {
      if (signal.aborted || !media.getAttribute("src")) return;
      if (media.error?.code === 1) return; // A cancelled load is not corrupt audio.
      playingRef.current = false;
      setPlaying(false);
      setBuffering(false);
      // A device/output failure is not a damaged recording. Reuse its audio.
      if (
        /audio_renderer|audio output|audio device/i.test(
          media.error?.message || "",
        )
      ) {
        playbackOnlyRef.current = true;
        setError(
          "Your browser could not open its audio output. Check your speaker connection, then press Play.",
        );
        return;
      }
      playbackOnlyRef.current = false;
      if ([3, 4].includes(media.error?.code))
        invalidAudioRef.current.add(indexRef.current);
      setError(
        `Chapter ${indexRef.current + 1} audio could not play. Retry audio to repair this chapter.`,
      );
    };

    function publish(index, stored) {
      const url = URL.createObjectURL(stored.blob);
      objectUrls.push(url);
      tracksRef.current[index] = { url, duration: stored.duration };
      sceneDurations[lesson.scenes[index].id] = stored.duration;
      if (stored.cues) sceneTimings[lesson.scenes[index].id] = stored.cues;
      // Keep measured chapter offsets current while later audio prepares.
      timelineRef.current = buildTimeline(
        lesson.scenes,
        sceneDurations,
        sceneTimings,
      );
      setDurations({ ...sceneDurations });
      setTimings({ ...sceneTimings });
      setLoadedCount(tracksRef.current.filter(Boolean).length);
      setReady(Boolean(tracksRef.current[0]));
      if (indexRef.current >= 0) {
        positionRef.current =
          timelineRef.current[indexRef.current].start +
          localPositionRef.current;
        setTime(positionRef.current);
      }
      if (indexRef.current === index || (indexRef.current < 0 && index === 0)) {
        switchRef.current(index, localPositionRef.current, playingRef.current);
      }
    }

    async function prepare() {
      let nextIndex = 0;
      async function worker() {
        while (nextIndex < lesson.scenes.length && !signal.aborted) {
          const index = nextIndex++;
          try {
            const stored = await loadChapterAudio({
              lesson,
              scene: lesson.scenes[index],
              getAudio,
              saveAudio,
              signal,
              ignoreCache: invalidAudioRef.current.has(index),
            });
            signal.throwIfAborted();
            invalidAudioRef.current.delete(index);
            publish(index, stored);
          } catch (failure) {
            if (signal.aborted) return;
            const message = `Chapter ${index + 1}: ${failure.message || "Narration could not be prepared. Please retry audio."}`;
            failuresRef.current.set(index, message);
            setError(message);
            if (indexRef.current === index) {
              playingRef.current = false;
              setPlaying(false);
              setBuffering(false);
            }
          }
        }
      }
      // Start the lesson as soon as its first recording is ready. Two workers
      // prepare the rest, without increasing paid concurrency or skipping review.
      const workers =
        lesson.source === "sample" ? Math.min(6, lesson.scenes.length) : 2;
      await Promise.all(Array.from({ length: workers }, worker));
      if (!signal.aborted) setPreparing(false);
    }
    prepare();
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      operationRef.current++;
      media.onended = media.onerror = media.onloadedmetadata = null;
      media.onwaiting = media.onplaying = null;
      media.pause();
      media.removeAttribute("src");
      media.load();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      if (audioRef.current === media) audioRef.current = null;
      playingRef.current = false;
    };
    // Content is immutable. Bookmark and chat updates must not restart playback.
  }, [lesson.id, attempt, getAudio, saveAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  const seek = useCallback(
    (value) => {
      if (!tracksRef.current[0]) return;
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
    [switchTrack],
  );

  const play = useCallback(() => {
    if (!tracksRef.current[0]) return;
    if (playbackOnlyRef.current) setError("");
    playbackOnlyRef.current = false;
    const position =
      positionRef.current >= timelineRef.current.at(-1).end - 0.05
        ? 0
        : positionRef.current;
    const state = resolvePlayback(timelineRef.current, position);
    positionRef.current = position;
    setTime(position);
    switchTrack(state.index, state.localTime, true);
  }, [switchTrack]);

  const restart = useCallback(() => {
    pause();
    seek(0);
  }, [pause, seek]);
  const setSpeed = useCallback((value) => {
    speedRef.current = value;
    setSpeedState(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  }, []);
  const retry = () => {
    if (playbackOnlyRef.current) return play();
    if (preparing) return;
    resumeRef.current = {
      index: Math.max(0, indexRef.current),
      localTime: localPositionRef.current,
    };
    setAttempt((value) => value + 1);
  };

  return {
    time,
    total,
    state: resolvePlayback(timeline, time),
    playing,
    loading: !ready && preparing && !error,
    preparing,
    buffering,
    loadedCount,
    chapterCount: lesson.scenes.length,
    error,
    speed,
    ready,
    retryDisabled: preparing && !playbackOnlyRef.current,
    retryLabel: playbackOnlyRef.current ? "Play narration" : "Retry audio",
    play,
    pause,
    seek,
    restart,
    setSpeed,
    retry,
  };
}
