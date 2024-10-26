import { API_URL } from '../constants';
import { authenticatedFetch } from '../utils/auth';
import { Cart, AlternativeCart } from '../types';

interface CompareCartResponse {
    alternativeCarts: AlternativeCart[];
}

async function getCurrentTabHostname() {
    try {
        let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url) {
            let url = new URL(tabs[0].url);
            return url.hostname;
        }
    } catch (error) {
        console.error("Error getting hostname:", error);
    }
    return null;
}

export const compareCart = async (originalCart: Cart): Promise<AlternativeCart[]> => {
    console.log('compareCart called with:', { originalCart });

    // get the current hostname of the client and add it to the cart object
    const hostname = await getCurrentTabHostname();
    console.log('Hostname:', hostname);
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

        const data: CompareCartResponse = await response.json();
        console.log('Parsed response data:', data);

        return data.alternativeCarts;
    } catch (error) {
        console.error('Error in compareCart:', error);
        throw error;
    }
};