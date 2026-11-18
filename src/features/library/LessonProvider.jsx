"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  readAudio,
  readLessons,
  removeLesson,
  writeAudio,
  writeLesson,
} from "@/lib/lesson-storage";

const LessonContext = createContext(null);

export function LessonProvider({ children }) {
  const [lessons, setLessons] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const current = useRef([]);
  const mutations = useRef(Promise.resolve());

  useEffect(() => {
    let mounted = true;
    readLessons()
      .then((items) => {
        if (mounted) {
          current.current = items;
          setLessons(items);
        }
      })
      .catch(() => {
        if (mounted)
          setStorageError(
            "Browser storage is unavailable. Enable site storage to save and play lessons.",
          );
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Serialize mutations so simultaneous chat/bookmark updates cannot overwrite each other.
  const enqueue = useCallback((operation) => {
    const next = mutations.current.then(operation);
    mutations.current = next.catch(() => {});
    return next.catch((error) => {
      setStorageError(error.message);
      throw error;
    });
  }, []);

  const saveLesson = useCallback(
    (lesson) =>
      enqueue(async () => {
        await writeLesson(lesson);
        current.current = [
          lesson,
          ...current.current.filter((item) => item.id !== lesson.id),
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setLessons(current.current);
        setStorageError("");
        return lesson;
      }),
    [enqueue],
  );

  const updateLesson = useCallback(
    (id, patch) =>
      enqueue(async () => {
        const existing = current.current.find((lesson) => lesson.id === id);
        if (!existing)
          throw new Error("This lesson is no longer in your library.");
        const updated = { ...existing, ...patch, id: existing.id };
        await writeLesson(updated);
        current.current = current.current.map((lesson) =>
          lesson.id === id ? updated : lesson,
        );
        setLessons(current.current);
        setStorageError("");
        return updated;
      }),
    [enqueue],
  );

  const deleteLesson = useCallback(
    (id) =>
      enqueue(async () => {
        await removeLesson(id);
        current.current = current.current.filter((lesson) => lesson.id !== id);
        setLessons(current.current);
        setStorageError("");
      }),
    [enqueue],
  );

  const getLesson = useCallback(
    (id) => lessons.find((lesson) => lesson.id === id),
    [lessons],
  );
  const getAudio = useCallback(
    (lessonId, sceneId) => readAudio(lessonId, sceneId),
    [],
  );
  const saveAudio = useCallback(
    (lessonId, sceneId, audio) => writeAudio(lessonId, sceneId, audio),
    [],
  );

  return (
    <LessonContext.Provider
      value={{
        lessons,
        ready,
        storageError,
        saveLesson,
        updateLesson,
        deleteLesson,
        getLesson,
        getAudio,
        saveAudio,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
}

export function useLessons() {
  const context = useContext(LessonContext);
  if (!context)
    throw new Error("useLessons must be used inside LessonProvider.");
  return context;
}
