const API_URL = "http://localhost:3000";

const DB_NAME = 'AuthDB';
const STORE_NAME = 'AuthTokens';
const DB_VERSION = 1;

// Initialize the IndexedDB
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

// Save auth tokens to IndexedDB
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

// Get auth tokens from IndexedDB
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

// Delete auth tokens from IndexedDB
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

const compareCart = async (originalCart, hostname) => {
    console.log('compareCart called with:', { originalCart });

    console.log('Hostname href:', hostname);
    const bodyObj = { ...originalCart, hostname };
    const body = JSON.stringify(bodyObj);

    try {
        console.log(`Sending POST request to ${API_URL}/search-products`);
        const response = await authenticatedFetch(`${API_URL}/search-products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Comparing cart contents failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Parsed response data:', data);

        return data.alternativeCarts;
    } catch (error) {
        console.error('Error in compareCart:', error);
        throw error;
    }
};

// Update the listener to use IndexedDB
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === "COMPARE_CART") {
        const originalCart = request.payload.products;
        const hostname = request.payload.hostname

        const cart = {
            cartProducts: originalCart,
            getTotalPrice: () => originalCart.reduce((total, product) => total + product.price * product.quantity, 0)
        };

        compareCart(cart, hostname)
            .then(result => {
                const cartsWithTotal = result.map(alternativeCart => {
                    const total = alternativeCart.products.reduce((cartTotal, product, index) => {
                        const quantity = originalCart[index].quantity;
                        return cartTotal + (product.price * quantity);
                    }, 0);
                    return { ...alternativeCart, total };
                });

                const originalTotal = originalCart.reduce((total, product) => total + product.price * product.quantity, 0);
                const sortedCarts = cartsWithTotal.sort((a, b) => {
                    const savingsA = originalTotal - a.total;
                    const savingsB = originalTotal - b.total;
                    return savingsB - savingsA;
                });

                sendResponse({ data: sortedCarts });
            })
            .catch(error => {
                console.error('Error comparing carts:', error);
                sendResponse({ error: 'Failed to compare carts. Please try again.' });
            });

        return true;
    }
});

// New function to handle login
const handleLogin = async (tokens) => {
    await saveAuthTokens(tokens);
};

// New function to handle logout
const handleLogout = async () => {
    await deleteAuthTokens();
};

export {
    handleLogin,
    handleLogout,
    authenticatedFetch,
    getAuthHeader
};