import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
    const { handleLogout } = useAuth();

    const renderComponent = () => {
        return (
            <main className="p-4 space-y-3">
                <ActionCard onClick={handleLogout} icon={LogOut} text="Logout" />
            </main>
        );
    };

    return (
        <div className="w-[100%] bg-blue-50 rounded-lg overflow-hidden shadow-lg mt-8">
            {renderComponent()}
        </div>
    );
};

export default Options;