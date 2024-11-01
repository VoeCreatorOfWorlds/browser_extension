import { API_URL } from '../constants';
import { authenticatedFetch } from '../utils/auth';
import { CartProduct } from '../types';

interface CartRetrievalResponse {
  cartProducts: Array<CartProduct>;
}


export const getCart = async (innerText: string): Promise<CartRetrievalResponse> => {

  if (!innerText) {
    return { cartProducts: [] };
  }

  const bodyObj = { cartDescription: innerText };
  const body = JSON.stringify(bodyObj);

  try {
    const response = await authenticatedFetch(`${API_URL}/cart-contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`retrieving cart contents failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};