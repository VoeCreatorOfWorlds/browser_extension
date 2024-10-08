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
        <header className="bg-gradient-to-r from-purple-100 to-indigo-100 w-full h-auto fixed top-0 z-50 shadow-lg">
            <div className="flex justify-around py-3 px-2">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        to={tab.path}
                        className={`flex flex-col items-center text-sm p-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-110
                            ${currentPath === tab.path
                                ? 'bg-gradient-to-r from-purple-200 to-indigo-200 shadow-md'
                                : 'hover:bg-purple-50'}`}
                    >
                        <div className={`p-2 rounded-full transition-all duration-300 ease-in-out
                            ${currentPath === tab.path
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                : 'bg-gradient-to-r from-purple-400 to-indigo-400'}`}>
                            <tab.icon
                                className={`w-5 h-5 transition-all duration-300 ease-in-out
                                    ${currentPath === tab.path ? 'text-white' : 'text-indigo-100'}`}
                            />
                        </div>
                        <span
                            className={`mt-1 text-xs font-medium transition-all duration-300 ease-in-out
                                ${currentPath === tab.path ? 'text-indigo-800' : 'text-indigo-600'}`}
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