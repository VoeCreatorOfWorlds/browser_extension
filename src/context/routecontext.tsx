import React, { createContext, useState } from 'react';

// Define our route structure
type Route = {
    path: string;
    component: React.ComponentType;
};

// Define our router context structure
type RouterContextType = {
    currentPath: string;
    navigate: (path: string) => void;
    routes: Route[];
};

// Create the context
export const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Create a provider component
export const RouterProvider: React.FC<{ routes: Route[], children: React.ReactNode }> = ({ routes, children }) => {
    const [currentPath, setCurrentPath] = useState<string>('/');

    const navigate = (path: string) => {
        setCurrentPath(path);
        // Update extension's storage for persistence
        chrome.storage.local.set({ currentPath: path });
    };
    /*
    useEffect(() => {
        // Retrieve last path from storage on mount
        chrome.storage.local.get(['currentPath'], (result) => {
            if (result.currentPath) {
                setCurrentPath(result.currentPath);
            }
        });
    }, []);*/

    return (
        <RouterContext.Provider value={{ currentPath, navigate, routes }}>
            {children}
        </RouterContext.Provider>
    );
};
