import React, { useState, useEffect } from 'react';
import { AlternativeCart, CartProduct } from '../../types';
import { compareCart } from '../../services/compareCartService';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompareProductCartsProps {
    originalCart: CartProduct[];
    onBack: () => void;
}

const getHostname = (url: string): string => {
    if (!url) return 'Unknown Site';

    try {
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        return new URL(url).hostname;
    } catch (error) {
        console.error(`Failed to parse URL: ${url}`, error);
        const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
        if (domainMatch) return domainMatch[1];
        return 'Unknown Site';
    }
};

const CompareProductCarts: React.FC<CompareProductCartsProps> = ({ originalCart, onBack }) => {
    const [alternativeCarts, setAlternativeCarts] = useState<AlternativeCart[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchAlternativeCarts = async () => {
            try {
                const cart = {
                    cartProducts: originalCart,
                    getTotalPrice: () => originalCart.reduce((total, product) => total + product.price * 1, 0)
                };
                const result = await compareCart(cart);
                console.log('Alternative carts:', result);

                const originalTotal = originalCart.reduce((total, product) => total + product.price * 1, 0);
                const sortedCarts = result.sort((a, b) => {
                    const savingsA = originalTotal - a.total;
                    const savingsB = originalTotal - b.total;
                    return savingsB - savingsA;
                });

                console.log('Sorted carts:', sortedCarts);

                setAlternativeCarts(sortedCarts);
            } catch (err) {
                console.error('Error fetching alternative carts:', err);
                setError('Failed to fetch alternative carts. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlternativeCarts();
    }, [originalCart]);

    const hasSavings = alternativeCarts.some(cart => {
        const originalTotal = originalCart.reduce((total, product) => total + product.price * 1, 0);
        return cart.total < originalTotal;
    });

    const headerMessage = hasSavings
        ? "Exciting Alternatives! 🎉"
        : "Great news! You've already found the best deal 🌟";

    const toggleRowExpansion = (cartIndex: number, productIndex: number) => {
        const rowKey = `${cartIndex}-${productIndex}`;
        setExpandedRows(prevExpandedRows => {
            const newExpandedRows = new Set(prevExpandedRows);
            if (newExpandedRows.has(rowKey)) {
                newExpandedRows.delete(rowKey);
            } else {
                newExpandedRows.add(rowKey);
            }
            return newExpandedRows;
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 m-3 text-sm" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="pb-8 w-full min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            <button
                onClick={onBack}
                className="m-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-full shadow-md hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105"
            >
                ← Back to Cart
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-indigo-800">{headerMessage}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
                {alternativeCarts.map((cart, cartIndex) => {
                    const originalTotal = originalCart.reduce((total, product) => total + product.price * 1, 0);
                    const savings = originalTotal - cart.total;
                    const isSavings = savings > 0;

                    return (
                        <div key={cartIndex} className={`bg-white rounded-md shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 animate-fade-in-up ${isSavings ? 'border-green-500' : 'border-red-500'}`} style={{ animationDelay: `${cartIndex * 100}ms` }}>
                            <div className={`px-4 py-2 ${isSavings ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-red-500 to-yellow-500'}`}>
                                <h3 className="text-base font-semibold text-white">
                                    Cart from {getHostname(cart.products[0]?.siteUrl || '')}
                                </h3>
                            </div>
                            <div className="p-4">
                                <table className="w-full mb-3 text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-1">Product</th>
                                            <th className="text-right py-1">Price</th>
                                            <th className="text-right py-1">Qty</th>
                                            <th className="w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.products.map((product, productIndex) => {
                                            const rowKey = `${cartIndex}-${productIndex}`;
                                            const isExpanded = expandedRows.has(rowKey);
                                            return (
                                                <React.Fragment key={productIndex}>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-1">{product.productName}</td>
                                                        <td className="text-right py-1">R {product.price}</td>
                                                        <td className="text-right py-1">{product.quantity}</td>
                                                        <td className="text-right py-1">
                                                            <motion.button
                                                                onClick={() => toggleRowExpansion(cartIndex, productIndex)}
                                                                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 focus:outline-none"
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <motion.div
                                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                >
                                                                    <ChevronDown size={16} />
                                                                </motion.div>
                                                            </motion.button>
                                                        </td>
                                                    </tr>
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.tr
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            >
                                                                <td colSpan={4} className="py-2 px-4">
                                                                    <motion.div
                                                                        className="text-xs text-gray-600 bg-gray-50 rounded-md p-3 shadow-inner"
                                                                        initial={{ y: -10, opacity: 0 }}
                                                                        animate={{ y: 0, opacity: 1 }}
                                                                        transition={{ delay: 0.1, duration: 0.2 }}
                                                                    >
                                                                        {product.description || 'No description available.'}
                                                                    </motion.div>
                                                                </td>
                                                            </motion.tr>
                                                        )}
                                                    </AnimatePresence>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="flex justify-between items-center bg-indigo-100 rounded-md p-2 text-sm">
                                    <span className="text-indigo-800 font-semibold">Total Price:</span>
                                    <span className="text-lg font-bold text-indigo-600">R {cart.total}</span>
                                </div>
                                <div className={`mt-2 rounded-md p-2 text-sm ${isSavings ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <p className={`font-semibold ${isSavings ? 'text-green-800' : 'text-red-800'}`}>
                                        {isSavings ? 'Potential Savings:' : 'Additional Cost:'}
                                    </p>
                                    <p className={`text-xl font-bold ${isSavings ? 'text-green-600' : 'text-red-600'}`}>
                                        R {Math.abs(savings).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CompareProductCarts;