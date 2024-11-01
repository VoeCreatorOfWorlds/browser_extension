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
        return null;
    }
    return null;
}

export const compareCart = async (originalCart: Cart): Promise<AlternativeCart[]> => {
    const hostname = await getCurrentTabHostname();
    const bodyObj = { ...originalCart, hostname };
    const body = JSON.stringify(bodyObj);

    try {
        const response = await authenticatedFetch(`${API_URL}/search-products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Comparing cart contents failed with status ${response.status}: ${errorText}`);
        }

        const data: CompareCartResponse = await response.json();

        return data.alternativeCarts;
    } catch (error) {
        throw error;
    }
};