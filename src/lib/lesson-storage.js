import { openBraynixDatabase } from "./storage-migration";

let database;
function getDatabase() {
  database ??= openBraynixDatabase("lessons", ["lessons", "audio"]).catch(
    (error) => {
      database = undefined;
      throw error;
    },
  );
  return database;
}

export async function readLessons() {
  const db = await getDatabase();
  return (await db.getAll("lessons")).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function writeLesson(lesson) {
  const db = await getDatabase();
  if (
    !(await db.get("lessons", lesson.id)) &&
    (await db.count("lessons")) >= 30
  ) {
    throw new Error(
      "Your library has 30 lessons. Remove an older lesson to make room.",
    );
  }
  return db.put("lessons", lesson);
}

export async function removeLesson(id) {
  const db = await getDatabase();
  const transaction = db.transaction(["lessons", "audio"], "readwrite");
  await transaction.objectStore("lessons").delete(id);
  const audio = transaction.objectStore("audio");
  let cursor = await audio.openCursor();
  while (cursor) {
    if (String(cursor.key).startsWith(`${id}:`)) await cursor.delete();
    cursor = await cursor.continue();
  }
  await transaction.done;
}

export async function readAudio(lessonId, sceneId) {
  return (await getDatabase()).get("audio", `${lessonId}:${sceneId}`);
}

export async function writeAudio(lessonId, sceneId, audio) {
  const db = await getDatabase();
  // A generation finishing after a lesson is deleted must not leave orphan audio.
  const tx = db.transaction(["lessons", "audio"], "readwrite");
  if (await tx.objectStore("lessons").get(lessonId)) {
    await tx.objectStore("audio").put(audio, `${lessonId}:${sceneId}`);
  }
  await tx.done;
}

export async function clearLessons() {
  const db = await getDatabase();
  const tx = db.transaction(["lessons", "audio"], "readwrite");
  await Promise.all([
    tx.objectStore("lessons").clear(),
    tx.objectStore("audio").clear(),
  ]);
  await tx.done;
}
