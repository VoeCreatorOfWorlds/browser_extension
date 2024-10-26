import React, { useEffect } from 'react';
import { RouterProvider } from './context/routecontext';
import { Router } from './components/Router/route';
import { useAuth } from './hooks/useAuth';
import { useTextExtraction } from './hooks/useTextExtraction';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignUpForm';
import CartContents from './components/TextExtraction/ExtractedTextDisplay';
import Options from './components/Header/Options';
import { AuthenticatedApp } from './components/Auth/AuthenticatedApp';
import './App.css';
import { LoadingAnimation } from './components/Loading/LoadingAnimation';

const Home: React.FC = () => {
  const { extractedText, loading: extractionLoading, extractText } = useTextExtraction();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      extractText();
    }
  }, [user, extractText]);

  if (extractionLoading) {
    return (
      <LoadingAnimation
        message="Analyzing Your Cart"
        submessage="Scanning page for cart contents..."
      />
    );
  }

  return <CartContents cartDescription={extractedText} />;
};

const UnauthenticatedApp: React.FC = () => {
  return (
    <div className="w-[100%] flex flex-col items-center justify-start h-[100%] bg-white">
      <Router />
    </div>
  );
};

const App: React.FC = () => {
  const { user, loading: authLoading, handleLogin, handleSignup } = useAuth();

  if (authLoading) {
    return <div>Loading...</div>;
  }

  const authenticatedRoutes = [
    { path: '/', component: Home },
    { path: '/settings', component: Options },
  ];

  const unauthenticatedRoutes = [
    { path: '/', component: () => <LoginForm onLogin={handleLogin} isLoading={authLoading} /> },
    { path: '/signup', component: () => <SignupForm onSignup={handleSignup} isLoading={authLoading} /> },
  ];

  return (
    <RouterProvider routes={user ? authenticatedRoutes : unauthenticatedRoutes}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </RouterProvider>
  );
};

export default App;