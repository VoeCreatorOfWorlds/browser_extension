import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/auth';
import { API_URL } from '../../constants';
import { Calendar, DollarSign, Loader } from 'lucide-react';

interface Card {
    id: string;
    title: string;
    expirationDate: string;
    amount: number;
}

const CardList: React.FC = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await authenticatedFetch(`${API_URL}/cards`);
                if (!response.ok) {
                    throw new Error('Failed to fetch cards');
                }
                const data = await response.json();
                setCards(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
    );

    if (error) return (
        <div className="text-center p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <h3 className="font-bold mb-1">Error</h3>
            <p className="text-sm">{error}</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-sm font-bold mb-6 text-gray-800 flex items-center">
                Your Virtual Cards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                    >
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 text-white">
                            <div className="text-xs uppercase tracking-wide opacity-75">Card Title</div>
                            <div className="text-lg font-bold truncate">{card.title}</div>
                        </div>
                        <div className="p-3">
                            <div className="mb-2 flex items-center">
                                <Calendar className="mr-2 text-gray-500 h-4 w-4" />
                                <div>
                                    <div className="text-xs text-gray-500">Expiration Date</div>
                                    <div className="text-sm font-semibold">{card.expirationDate}</div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center mb-1">
                                    <DollarSign className="mr-2 text-gray-500 h-4 w-4" />
                                    <div className="text-xs text-gray-500">Amount</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex-grow bg-gray-200 rounded-full h-1.5 mr-2">
                                        <div
                                            className="bg-green-400 h-1.5 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.min(card.amount / 10, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-semibold">${card.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {cards.length === 0 && (
                <div className="text-center p-6 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Cards Found</h3>
                    <p className="text-sm text-gray-500">You don't have any virtual cards yet.</p>
                </div>
            )}
        </div>
    );
};

export default CardList;