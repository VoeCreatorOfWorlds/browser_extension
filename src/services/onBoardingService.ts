import { OnboardingStatus } from '../types';
import { authenticatedFetch } from '../utils/auth';
import { API_URL } from '../constants';

export const checkOnboardingStatus = async (): Promise<OnboardingStatus> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/kyc-check`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("error data: ", errorData);
      if (response.status === 401) {
        throw new Error(`401 ${errorData.message || 'Unauthorized access'}`);
      }
      throw new Error(errorData.message || 'Failed to fetch onboarding status');
    }

    const data: OnboardingStatus = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw error;
  }
};