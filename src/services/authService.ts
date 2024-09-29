import { AuthTokens } from '../types';
import { API_URL } from '../constants';


export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

export interface SignupData {
  email: string;
  password: string;
  contactNumber: string;
  is_business: boolean;
  businessName?: string;
  businessAddress?: string;
  businessType?: string;
  businessRegistrationNumber?: string;
  businessRegistrationDate?: string;
}

export const signup = async (signupData: SignupData): Promise<AuthTokens> => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }

  return response.json();
};

export const logout = async () => {
  // Implement logout logic (e.g., invalidate token on server)
};