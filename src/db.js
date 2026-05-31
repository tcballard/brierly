import { openDB } from 'idb';

// Single store, keyed on id. No migration framework on purpose: if the shape
// changes, export -> wipe -> re-import (see DataIO). The export file is the
// real backup; IndexedDB is per-browser.
const DB_NAME = 'brierly';
const STORE = 'predictions';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE, { keyPath: 'id' });
  },
});

export async function loadAll() {
  return (await dbPromise).getAll(STORE);
}

export async function put(prediction) {
  return (await dbPromise).put(STORE, prediction);
}

export async function remove(id) {
  return (await dbPromise).delete(STORE, id);
}
