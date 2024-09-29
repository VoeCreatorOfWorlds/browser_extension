import { API_URL } from '../constants';
import { authenticatedFetch } from '../utils/auth';

interface CartRetrievalResponse {
  cartProducts: Array<{
    productName: string;
    price: number;
    quantity: number;
  }>;
}


export const getCart = async (innerText: string): Promise<CartRetrievalResponse> => {
  console.log('getCart called with innerText:', innerText);
  
  if (!innerText) {
    console.warn('Warning: innerText is empty or undefined');
  }

  const bodyObj = { cartDescription: innerText };
  const body = JSON.stringify(bodyObj);
  console.log('Request body (stringified):', body);

  try {
    console.log(`Sending POST request to ${API_URL}/cart-contents`);
    const response = await authenticatedFetch(`${API_URL}/cart-contents`, {
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
      throw new Error(`retrieving cart contents failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Parsed response data:', data);

    return data;
  } catch (error) {
    console.error('Error in getCart:', error);
    throw error;
  }
};