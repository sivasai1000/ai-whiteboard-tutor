import { openDB } from "idb";

function migrateLesson(lesson, namespace) {
  return {
    ...lesson,
    scenes: lesson.scenes.map((scene) => ({
      ...scene,
      // Carry the original signing context inside the opaque token. The server
      // still checks the HMAC, narration hash and original expiry; no AI call.
      speechToken:
        scene.speechToken?.split(".").length === 2
          ? `${scene.speechToken}.${btoa(`${namespace}-narration-v1`)}`
          : scene.speechToken,
    })),
  };
}

async function importDatabase(target, source, kind, stores, namespace) {
  const read = source.transaction(stores, "readonly");
  const rows = await Promise.all(
    stores.map(async (name) => ({
      name,
      keys: await read.objectStore(name).getAllKeys(),
      values: await read.objectStore(name).getAll(),
    })),
  );
  await read.done;

  // Copy every record and audio Blob in a single transaction. If space runs
  // out, nothing is committed and the original database remains untouched.
  const write = target.transaction([...stores, "migrations"], "readwrite");
  const completion = write.done;
  // Mark rejection as handled while individual requests are being awaited.
  completion.catch(() => {});
  try {
    if (!(await write.objectStore("migrations").get("previous-version"))) {
      for (const { name, keys, values } of rows) {
        const store = write.objectStore(name);
        for (let index = 0; index < values.length; index++) {
          if ((await store.get(keys[index])) !== undefined) continue;
          const value =
            kind === "lessons" && name === "lessons"
              ? migrateLesson(values[index], namespace)
              : values[index];
          if (store.keyPath) await store.put(value);
          else await store.put(value, keys[index]);
        }
      }
      await write.objectStore("migrations").put(true, "previous-version");
    }
    await completion;
  } catch (error) {
    try {
      write.abort();
    } catch {
      /* Already aborted. */
    }
    await completion.catch(() => {});
    throw error;
  }
}

async function migratePreviousDatabase(target, kind, stores) {
  if (typeof indexedDB.databases !== "function") return;
  const databases = await indexedDB.databases();
  const suffix = `-${kind}`;
  const candidates = databases.filter(
    ({ name, version }) =>
      name !== target.name &&
      version === 1 &&
      /^[a-z][a-z0-9]{0,40}-(lessons|conversations)$/.test(name || "") &&
      name.endsWith(suffix),
  );
  // An ambiguous match is left alone rather than merging unrelated data.
  if (candidates.length !== 1) return;
  const { name } = candidates[0];
  if (await target.get("migrations", "previous-version")) {
    // A pending deletion may be blocked by an old tab. Opening that database
    // again would wait behind the deletion and prevent the new app loading.
    const cleanup = indexedDB.deleteDatabase(name);
    cleanup.onerror = () => {};
    return;
  }
  const source = await openDB(name, 1);
  let imported = false;
  try {
    if (
      source.objectStoreNames.length !== stores.length ||
      !stores.every((store) => source.objectStoreNames.contains(store))
    )
      return;
    const schema = source.transaction(stores, "readonly");
    const validSchema = stores.every(
      (store) =>
        schema.objectStore(store).keyPath === (store === "audio" ? null : "id"),
    );
    await schema.done;
    if (!validSchema) return;
    await importDatabase(
      target,
      source,
      kind,
      stores,
      name.slice(0, -suffix.length),
    );
    imported = true;
  } finally {
    source.close();
  }
  if (imported) {
    // Do not block startup when an old tab still holds this database open.
    // The completion marker prevents re-importing deleted records on reload.
    const cleanup = indexedDB.deleteDatabase(name);
    cleanup.onerror = () => {};
  }
}

export async function openBraynixDatabase(kind, stores) {
  const database = await openDB(`braynix-${kind}`, 1, {
    upgrade(db) {
      for (const store of stores) {
        db.createObjectStore(
          store,
          store === "audio" ? undefined : { keyPath: "id" },
        );
      }
      db.createObjectStore("migrations");
    },
    blocking() {
      database.close();
    },
  });
  try {
    await migratePreviousDatabase(database, kind, stores);
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}
