import React, { useState, useEffect } from 'react';
import { getCart } from '../../services/cartService';
import { Compare } from '../Auth/Checkout';
import CompareProductCarts from '../CartCompare/CartCompare';
import { CartProduct } from '../../types';



interface CartResponse {
    cartProducts: CartProduct[];
    //total?: number;
}

interface CartContentsProps {
    cartDescription: string;
}

const CartContents: React.FC<CartContentsProps> = ({ cartDescription }) => {
    const [cartItems, setCartItems] = useState<CartProduct[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showComparison, setShowComparison] = useState<boolean>(false);

    useEffect(() => {
        const fetchCartContents = async () => {
            if (!cartDescription.trim()) {
                setCartItems([]);
                setError(null);
                return;
            }

            setIsLoading(true);
            try {
                const response: CartResponse = await getCart(cartDescription);
                setCartItems(response.cartProducts);
                setError(null);
            } catch (err) {
                setError('Failed to fetch cart contents. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCartContents();
    }, [cartDescription]);

    const calculateTotal = (price: number, quantity: number): number => price * quantity;

    const overallTotal = cartItems.reduce(
        (sum, item) => sum + calculateTotal(item.price, item.quantity),
        0
    );

    const truncateName = (name: string, maxLength = 50): string =>
        name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;

    const handleCompare = () => {
        setShowComparison(true);
    };

    if (showComparison) {
        return <CompareProductCarts originalCart={cartItems} onBack={() => setShowComparison(false)} />;
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-100 pb-20">
            <div className="w-full p-4 sm:p-6">
                <h1 className="text-2xl font-bold text-indigo-800 mb-6">Your Cart</h1>

                <div className="flex-grow overflow-auto">
                    {isLoading && (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md mb-4">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && cartItems.length === 0 && (
                        <p className="text-center text-indigo-600">Your cart is empty.</p>
                    )}

                    {!isLoading && !error && cartItems.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-200 to-indigo-200">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase">
                                            Price
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase">
                                            Qty
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                    {cartItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-indigo-50 transition-colors duration-150">
                                            <td className="px-4 sm:px-6 py-4 whitespace-normal">
                                                <div className="text-sm font-medium text-indigo-900 break-words">
                                                    {truncateName(item.productName)}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-indigo-600">
                                                R {item.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-indigo-600">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-indigo-600 font-semibold">
                                                R {calculateTotal(item.price, item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!isLoading && !error && cartItems.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t border-indigo-200">
                        <Compare
                            onCompare={handleCompare}
                            total={overallTotal}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartContents;