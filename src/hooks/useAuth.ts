import { useState, useEffect } from 'react';
import { login, logout, signup, SignupData } from '../services/authService';
import { User } from '../types';
import { getAuthTokens, saveAuthTokens, deleteAuthTokens } from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const tokens = await getAuthTokens();
        if (tokens) {
          // Assuming tokens contain user information
          setUser({ email: "" });
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const tokens = await login(email, password);
      await saveAuthTokens(tokens);
      setUser({ email });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (signupData: SignupData) => {
    setLoading(true);
    try {
      const tokens = await signup(signupData);
      await saveAuthTokens(tokens);
      setUser({ email: signupData.email });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      await deleteAuthTokens();
      await logout();
      if (chrome && chrome.runtime && chrome.runtime.reload) {
        chrome.runtime.reload();
      } else {
        window.location.reload();
      }
    } catch (error) {
      throw error;
    }
  };

  return { user, loading, handleLogin, handleLogout, handleSignup };
};