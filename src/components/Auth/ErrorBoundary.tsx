import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    is401Error: boolean;
}

class UnauthorizedErrorBoundaryClass extends Component<
    ErrorBoundaryProps & { handleLogout: () => void; navigateToLogin: () => void },
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps & { handleLogout: () => void; navigateToLogin: () => void }) {
        super(props);
        this.state = { hasError: false, is401Error: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, is401Error: error.message.includes('401') };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        if (error.message.includes('401')) {
            this.props.handleLogout();
            this.props.navigateToLogin();
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.state.is401Error) {
                // The navigation will be handled in componentDidCatch
                return null;
            }
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}

export const UnauthorizedErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
    const { handleLogout } = useAuth();
    const { navigate } = useRouter();

    const navigateToLogin = () => {
        navigate('/');
    };

    return (
        <UnauthorizedErrorBoundaryClass
            handleLogout={handleLogout}
            navigateToLogin={navigateToLogin}
        >
            {children}
        </UnauthorizedErrorBoundaryClass>
    );
};