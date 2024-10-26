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
      } catch (error) {
        console.error('Error fetching user:', error);
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
      console.log('Tokens: ', tokens);
      await saveAuthTokens(tokens);
      setUser({ email });
      console.log('Tokens saved');
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
      await saveAuthTokens(tokens);
      setUser({ email: signupData.email });
      console.log('Tokens saved');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      await deleteAuthTokens();
      console.log('Tokens deleted');
      await logout();
      console.log('Logout successful');
      if (chrome && chrome.runtime && chrome.runtime.reload) {
        chrome.runtime.reload();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return { user, loading, handleLogin, handleLogout, handleSignup };
};