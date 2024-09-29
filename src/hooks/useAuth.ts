import { useState, useEffect } from 'react';
import { User } from '../types';
import { login, logout, signup, SignupData } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      // Validate token and set user
      setUser(JSON.parse(tokens));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const tokens = await login(email, password);
      setUser({ email });
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (signupData: SignupData) => {
    console.log("Handling signup:", signupData);
    setLoading(true);
    try {
      const tokens = await signup(signupData);
      setUser({ email: signupData.email });
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    localStorage.removeItem('authTokens');
    
    // Reload the extension
    if (chrome && chrome.runtime && chrome.runtime.reload) {
      chrome.runtime.reload();
    } else {
      // Fallback for non-Chrome browsers or environments
      window.location.reload();
    }
  };

  return { user, loading, handleLogin, handleLogout, handleSignup };
};