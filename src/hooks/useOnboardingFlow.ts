import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkOnboardingStatus } from '../services/onBoardingService';
import { OnboardingStatus} from '../types';

export const useOnboardingFlow = () => {
  const { user } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    isComplete: false,
    currentStep: 'not_started',
  });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const status = await checkOnboardingStatus();
        setOnboardingStatus(status);
      } catch (error) {
          console.error('Error fetching onboarding status:', error);
          setError(error instanceof Error ? error.message : String(error))
          throw error
        //setOnboardingStatus({ isComplete: false, currentStep: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [user]);

  const refreshOnboardingStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const status = await checkOnboardingStatus();
      setOnboardingStatus(status);
    } catch (error) {
      console.error('Error refreshing onboarding status:', error);
      setOnboardingStatus({ isComplete: false, currentStep: 'error' });
    } finally {
      setLoading(false);
    }
  };
    
    if (error != "") {
        throw Error(error)
    }

  return { ...onboardingStatus, loading, refreshOnboardingStatus };
};