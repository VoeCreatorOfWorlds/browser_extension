interface AppState {
  isLoggedIn: boolean;
  email: string;
  password: string;
  extractedText: string;
  isLoading: boolean;
  error: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface User {
  email: string;
}

type KycStep = 
  | 'not_started'
  | 'business_kyc_start'
  | 'user_kyc_start'
  | 'business_kyc_pending'
  | 'user_kyc_pending'
  | 'business_kyc_resubmit'
  | 'user_kyc_resubmit'
  | 'verification_in_progress'
  | 'complete'
  | 'error';

interface OnboardingStatus {
  isComplete: boolean;
  currentStep: KycStep;
}

export type {AppState, AuthTokens, User, OnboardingStatus, KycStep}