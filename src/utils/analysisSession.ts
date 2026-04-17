/* eslint-disable no-async-promise-executor */
type StoredUpload = {
  id: string;
  blob: Blob;
  savedAt: number;
};

const ANALYSIS_STATE_KEY = 'seeing-sounds:analysis-state';
const DB_NAME = 'seeing-sounds-db';
const DB_VERSION = 1;
const UPLOAD_STORE = 'uploaded-audio';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(UPLOAD_STORE)) {
        db.createObjectStore(UPLOAD_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storePut<T>(storeName: string, value: T): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDb();
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

function storeGet<T>(storeName: string, key: string): Promise<T | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDb();
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(key);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export async function persistUploadedAudio(uploadId: string, blob: Blob): Promise<void> {
  const payload: StoredUpload = {
    id: uploadId,
    blob,
    savedAt: Date.now(),
  };

  await storePut(UPLOAD_STORE, payload);
}

export async function getPersistedUploadedAudio(uploadId: string): Promise<Blob | null> {
  const result = await storeGet<StoredUpload>(UPLOAD_STORE, uploadId);
  return result?.blob ?? null;
}

export function persistAnalysisState<T>(report: T): void {
  sessionStorage.setItem(ANALYSIS_STATE_KEY, JSON.stringify(report));
}

export function readPersistedAnalysisState<T>(): T | null {
  const raw = sessionStorage.getItem(ANALYSIS_STATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
