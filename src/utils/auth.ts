const DB_NAME = 'AuthDB';
const STORE_NAME = 'AuthTokens';
const DB_VERSION = 1;

interface AuthTokens {
  access_token: string;
}

// Initialize the IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening database");
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
  });
};

// Save auth tokens to IndexedDB
export const saveAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: 'authTokens', ...tokens });

    request.onerror = () => reject("Error saving auth tokens");
    request.onsuccess = () => resolve();
  });
};

// Get auth tokens from IndexedDB
export const getAuthTokens = async (): Promise<AuthTokens | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('authTokens');

    request.onerror = () => reject("Error getting auth tokens");
    request.onsuccess = () => resolve(request.result ? request.result : null);
  });
};

// Delete auth tokens from IndexedDB
export const deleteAuthTokens = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('authTokens');

    request.onerror = () => reject("Error deleting auth tokens");
    request.onsuccess = () => resolve();
  });
};

export const getAuthHeader = async (): Promise<Headers> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  try {
    const tokens = await getAuthTokens();
    if (tokens && tokens.access_token) {
      headers.append('Authorization', `Bearer ${tokens.access_token}`);
    }

    console.log("tokens:", tokens);
  } catch (error) {
    console.error("Error getting auth tokens:", error);
  }

  return headers;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authHeaders = await getAuthHeader();

  // Create a new Headers object with the original options.headers (if any)
  const mergedHeaders = new Headers(options.headers);

  // Append auth headers to the merged headers
  authHeaders.forEach((value, key) => {
    if (!mergedHeaders.has(key)) {
      mergedHeaders.append(key, value);
    }
  });

  // Create the merged options
  const mergedOptions: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  return fetch(url, mergedOptions);
};