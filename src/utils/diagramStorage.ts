/**
 * IndexedDB storage helper for imported electrical diagrams.
 * Uses bounded in-memory cache to prevent memory bloating on low-RAM mobile devices.
 */

const DB_NAME = 'SimuRelayDiagramsDB';
const DB_VERSION = 1;
const STORE_NAME = 'diagram_blobs';

// Bounded in-memory cache (keeps only current active diagram, max 1 item to prevent memory buildup)
const DIAGRAM_MEMORY_CACHE = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDiagramDataUrl(id: string, dataUrl: string): Promise<void> {
  // Prune any existing entries in memory cache to keep heap footprint near zero
  if (DIAGRAM_MEMORY_CACHE.size > 0 && !DIAGRAM_MEMORY_CACHE.has(id)) {
    DIAGRAM_MEMORY_CACHE.clear();
  }
  DIAGRAM_MEMORY_CACHE.set(id, dataUrl);

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put({ id, dataUrl, updatedAt: Date.now() });

      putReq.onsuccess = () => resolve();
      putReq.onerror = () => {
        console.warn('[DiagramStorage] IndexedDB write putReq error, in-memory retained');
        resolve();
      };
    });
  } catch (err) {
    console.warn('[DiagramStorage] IndexedDB write skipped or unsupported', err);
  }
}

export async function getDiagramDataUrl(id: string): Promise<string | null> {
  // Check memory cache first
  if (DIAGRAM_MEMORY_CACHE.has(id)) {
    return DIAGRAM_MEMORY_CACHE.get(id) || null;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.dataUrl) {
          DIAGRAM_MEMORY_CACHE.clear();
          DIAGRAM_MEMORY_CACHE.set(id, getReq.result.dataUrl);
          resolve(getReq.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('[DiagramStorage] Fallback: IndexedDB read failed', err);
    return null;
  }
}

export async function deleteDiagramData(id: string): Promise<void> {
  DIAGRAM_MEMORY_CACHE.delete(id);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(id);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch (err) {
    console.warn('[DiagramStorage] IndexedDB delete error', err);
  }
}
