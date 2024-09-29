import React, { useState, useEffect } from 'react';
import { getCart } from '../../services/cartService';
import { CheckoutButtons } from '../Auth/Checkout';

interface CartProduct {
    productName: string;
    price: number;
    quantity: number;
}

interface CartResponse {
    cartProducts: CartProduct[];
}

interface CartContentsProps {
    cartDescription: string;
}

const CartContents: React.FC<CartContentsProps> = ({ cartDescription }) => {
    const [cartItems, setCartItems] = useState<CartProduct[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="flex flex-col h-[100%]">
            <div className="w-full">
                <h1 className="text-sm sm:text-xl font-bold p-4 sm:p-6 ">Cart Contents</h1>

                <div className="flex-grow overflow-auto px-4 pb-6">
                    {isLoading && (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
                    )}

                    {!isLoading && !error && cartItems.length === 0 && (
                        <p className="text-center text-gray-600">No items in the cart.</p>
                    )}

                    {!isLoading && !error && cartItems.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Price
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Qty
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cartItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-100 transition-all">
                                            <td className="px-4 sm:px-6 py-4 whitespace-normal">
                                                <div className="text-xs font-medium text-gray-900 break-words">
                                                    {truncateName(item.productName)}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-xs text-gray-500">
                                                R {item.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-xs text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-xs text-gray-500">
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
                    <>
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
                            <CheckoutButtons
                                onCheckout={() => console.log('Proceed to Checkout')}
                                total={overallTotal}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartContents;
