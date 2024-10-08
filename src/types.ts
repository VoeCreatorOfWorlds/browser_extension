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

export interface CartProduct {
  productName: string;
  price: number;
  siteUrl: string;
  description: string;
  quantity: number;
}

export interface AlternativeProduct extends CartProduct {
  url: string;
  siteUrl: string;
  quantity: number;
}

export interface Cart {
  cartProducts: CartProduct[];
  getTotalPrice: () => number;
}

export interface AlternativeCart {
  products: AlternativeProduct[];
  originalProducts: CartProduct[];
  total: number;
}

export type { AppState, AuthTokens, User, OnboardingStatus, KycStep }