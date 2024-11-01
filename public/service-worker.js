const API_URL = "https://api.buybook.co.za";

const DB_NAME = 'AuthDB';
const STORE_NAME = 'AuthTokens';
const DB_VERSION = 1;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject("Error opening database");
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
    });
};

const saveAuthTokens = async (tokens) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: 'authTokens', ...tokens });

        request.onerror = () => reject("Error saving auth tokens");
        request.onsuccess = () => resolve();
    });
};

const getAuthTokens = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('authTokens');

        request.onerror = () => reject("Error getting auth tokens");
        request.onsuccess = () => resolve(request.result ? request.result : null);
    });
};

const deleteAuthTokens = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete('authTokens');

        request.onerror = () => reject("Error deleting auth tokens");
        request.onsuccess = () => resolve();
    });
};

const getAuthHeader = async () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const tokens = await getAuthTokens();
    if (tokens) {
        headers.append('Authorization', `Bearer ${tokens.access_token}`);
    }

    return headers;
};

const authenticatedFetch = async (url, options = {}) => {
    const authHeaders = await getAuthHeader();

    const mergedHeaders = new Headers(options.headers);

    authHeaders.forEach((value, key) => {
        if (!mergedHeaders.has(key)) {
            mergedHeaders.append(key, value);
        }
    });

    const mergedOptions = {
        ...options,
        headers: mergedHeaders,
    };

    return fetch(url, mergedOptions);
};

const handleProductClick = async (clickData) => {
    try {
        const response = await authenticatedFetch(`${API_URL}/track/product-clicks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clickData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Click tracking failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};

const CACHE_DB_NAME = 'CartComparisonCache';
const CACHE_STORE_NAME = 'CartComparisons';
const CACHE_DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const initCacheDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);

        request.onerror = () => reject("Error opening cache database");
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const store = db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' });
            
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('hostname', 'hostname', { unique: false });
        };
    });
};

const generateCacheKey = (cart, hostname) => {
    const cartKey = cart.cartProducts
        .map(p => `${p.productName}_${p.price}_${p.quantity}`)
        .sort()
        .join('|');
    return `${hostname}_${cartKey}`;
};

const saveToCache = async (cart, hostname, result) => {
    const db = await initCacheDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CACHE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);

        const cacheEntry = {
            id: generateCacheKey(cart, hostname),
            cart: {
                cartProducts: cart.cartProducts,
                totalPrice: cart.totalPrice
            },
            hostname: hostname,
            result: result,
            timestamp: Date.now()
        };

        const request = store.put(cacheEntry);
        request.onerror = () => reject("Error saving to cache");
        request.onsuccess = () => resolve(result);
    });
};

const getFromCache = async (cart, hostname) => {
    const db = await initCacheDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CACHE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const request = store.get(generateCacheKey(cart, hostname));

        request.onerror = () => reject("Error reading from cache");
        request.onsuccess = () => {
            const result = request.result;
            if (result && (Date.now() - result.timestamp) < CACHE_DURATION) {
                resolve(result.result);
            } else {
                resolve(null);
            }
        };
    });
};

const clearExpiredCache = async () => {
    const db = await initCacheDB();
    const expiryTime = Date.now() - CACHE_DURATION;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CACHE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const index = store.index('timestamp');
        
        const range = IDBKeyRange.upperBound(expiryTime);
        const request = index.openCursor(range);
        
        request.onerror = () => reject("Error clearing expired cache");
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
            } else {
                resolve();
            }
        };
    });
};

const compareCart = async (originalCart, hostname) => {
    try {
        const cachedResult = await getFromCache(originalCart, hostname);
        if (cachedResult) {
            return cachedResult;
        }

        const bodyObj = {
            cartProducts: originalCart.cartProducts,
            hostname
        };

        const response = await authenticatedFetch(`${API_URL}/search-products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyObj),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Comparing cart contents failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        await saveToCache(originalCart, hostname, data.alternativeCarts);
        
        clearExpiredCache().catch(_ => {});

        return data.alternativeCarts;
    } catch (error) {
        throw error;
    }
};

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === "COMPARE_CART") {
        const originalCart = request.payload.products;
        const hostname = request.payload.hostname;

        const cartForComparison = {
            cartProducts: originalCart,
            totalPrice: originalCart.reduce((total, product) => total + product.price * product.quantity, 0)
        };

        compareCart(cartForComparison, hostname)
            .then(result => {
                const cartsWithTotal = result.map(alternativeCart => {
                    const total = alternativeCart.products.reduce((cartTotal, product, index) => {
                        const quantity = originalCart[index].quantity;
                        return cartTotal + (product.price * quantity);
                    }, 0);
                    return { ...alternativeCart, total };
                });

                const originalTotal = cartForComparison.totalPrice;
                const sortedCarts = cartsWithTotal.sort((a, b) => {
                    const savingsA = originalTotal - a.total;
                    const savingsB = originalTotal - b.total;
                    return savingsB - savingsA;
                });

                sendResponse({ data: sortedCarts });
            })
            .catch(error => {
                console.log('Error in compareCart: ', error);
                sendResponse({ error: 'Failed to compare carts. Please try again.' });
            });

        return true;
    }
    
    if (request.type === "TRACK_PRODUCT_CLICK") {
        handleProductClick(request.payload)
            .then(result => {
                sendResponse({ success: true, data: result });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        
        return true;
    }
});

const handleLogin = async (tokens) => {
    await saveAuthTokens(tokens);
};

const handleLogout = async () => {
    await deleteAuthTokens();
};

export {
    handleLogin,
    handleLogout,
    authenticatedFetch,
    getAuthHeader
};