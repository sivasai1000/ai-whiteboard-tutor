import { openBraynixDatabase } from "./storage-migration";

let database;
function getDatabase() {
  database ??= openBraynixDatabase("conversations", ["conversations"]).catch(
    (error) => {
      database = undefined;
      throw error;
    },
  );
  return database;
}

export async function readConversations() {
  return (await (await getDatabase()).getAll("conversations")).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function writeConversation(conversation) {
  return (await getDatabase()).put("conversations", conversation);
}

export async function removeConversation(id) {
  return (await getDatabase()).delete("conversations", id);
}
