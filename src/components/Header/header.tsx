import React from 'react';
import { Home, CreditCard, CircleEllipsis } from 'lucide-react';
import { Link } from '../Router/route';
import { useRouter } from '../../hooks/useRouter';

interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
}

interface HeaderProps {
    tabs?: Tab[];
}

const defaultTabs: Tab[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'cards', label: 'Cards', icon: CreditCard, path: '/cards' },
    { id: 'settings', label: 'Options', icon: CircleEllipsis, path: '/settings' },
];

const Header: React.FC<HeaderProps> = ({ tabs = defaultTabs }) => {
    const { currentPath } = useRouter();

    return (
        <header className="bg-blue-100 w-full h-auto fixed top-0 z-50 shadow-md">
            <div className="flex justify-around py-2">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        to={tab.path}
                        className={`flex flex-col items-center text-sm p-2 rounded-lg w-fit transition-colors 
                            ${currentPath === tab.path ? 'bg-blue-200' : 'hover:bg-blue-50'}`}
                    >
                        <tab.icon
                            className={`w-6 h-6 
                                ${currentPath === tab.path ? 'text-blue-600' : 'text-blue-400'}`}
                        />
                        <span
                            className={`mt-1 text-sm transition-all 
                                ${currentPath === tab.path ? 'text-blue-600 font-medium' : 'text-blue-400'}`}
                        >
                            {tab.label}
                        </span>
                    </Link>
                ))}
            </div>
        </header>
    );
};

export default Header;