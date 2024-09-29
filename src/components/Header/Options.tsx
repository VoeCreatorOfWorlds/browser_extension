import React, { useState } from 'react';
import { Bell, LogOut, HandCoins, Glasses, User, CreditCard } from 'lucide-react';
import CreateCardForm from '../Card/CreateCardRequest';

interface ActionCardProps {
    onClick: () => void;
    icon: React.ElementType;
    text: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ onClick, icon: Icon, text }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
        <Icon className="text-blue-600 mr-3" size={24} />
        <span className="text-gray-800 font-medium">{text}</span>
    </button>
);

const Options: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState<string | null>(null);

    const handleAction = (action: string): void => {
        console.log(`${action} clicked`);
        setActiveComponent(action);
    };

    const handleLogout = async (): Promise<void> => {
        try {
            localStorage.removeItem('authTokens');
            if (chrome.runtime && chrome.runtime.reload) {
                chrome.runtime.reload();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const renderComponent = () => {
        switch (activeComponent) {
            case 'ask':
                return <CreateCardForm onBack={() => setActiveComponent(null)} />;
            case 'viewAsks':
                return <div>View Asks Component</div>;
            case 'notifications':
                return <div>Notifications Component</div>;
            case 'account':
                return <div>Account Component</div>; // Replace with actual Account component
            case 'createCard':
                return <div>Create Card Component</div>; // Replace with actual Create Card component
            default:
                return (
                    <main className="p-4 space-y-3">
                        <ActionCard onClick={() => handleAction('createCard')} icon={CreditCard} text="Create Card" />
                        <ActionCard onClick={() => handleAction('ask')} icon={HandCoins} text="Ask" />
                        <ActionCard onClick={() => handleAction('viewAsks')} icon={Glasses} text="View Asks" />
                        <ActionCard onClick={() => handleAction('notifications')} icon={Bell} text="Notifications" />
                        <ActionCard onClick={() => handleAction('account')} icon={User} text="Account" />
                        <ActionCard onClick={handleLogout} icon={LogOut} text="Logout" />
                    </main>
                );
        }
    };

    return (
        <div className="w-[100%] bg-blue-50 rounded-lg overflow-hidden shadow-lg mt-8">
            {renderComponent()}
        </div>
    );
};

export default Options;