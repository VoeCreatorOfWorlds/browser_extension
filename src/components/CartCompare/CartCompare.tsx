import React, { useState, useEffect } from 'react';
import { AlternativeCart, CartProduct } from '../../types';
import { ChevronDown, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingAnimation } from '../Loading/LoadingAnimation';
import { authenticatedFetch } from '../../utils/auth';

interface CompareProductCartsProps {
    products: CartProduct[];
}
interface CompareCartResponse {
    data?: AlternativeCart[];
    error?: string;
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

const CompareProductCarts: React.FC<CompareProductCartsProps> = ({ products }) => {
    const [alternativeCarts, setAlternativeCarts] = useState<AlternativeCart[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const handleProductClick = async (product: CartProduct, url: string, event: React.MouseEvent) => {
        event.preventDefault();

        try {
            // Log the click to your backend
            await authenticatedFetch('/track/product-clicks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName: product.productName,
                    productUrl: url,
                    price: product.price,
                    timestamp: new Date().toISOString(),
                    siteUrl: getHostname(url)
                })
            });

            // Open the product URL in a new tab
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to log product click:', error);
            // Still open the URL even if logging fails
            window.open(url, '_blank');
        }
    };


    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getCurrentTab = async () => {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.url) {
                const url = new URL(tabs[0].url);
                return url.hostname;
            }
            return '';
        };

        const fetchAlternativeCarts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get the hostname first
                const hostname = await getCurrentTab();

                const response = await new Promise<CompareCartResponse>((resolve, reject) => {
                    chrome.runtime.sendMessage(
                        {
                            type: "COMPARE_CART",
                            payload: {
                                products,
                                hostname // Include hostname in the payload
                            }
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else {
                                resolve(response);
                            }
                        }
                    );
                });

                if (controller.signal.aborted) return;

                if (response && response.data) {
                    console.log("Alternative carts received:", response.data);
                    if (isMounted) {
                        setAlternativeCarts(response.data);
                        setIsLoading(false);
                    }
                } else if (response && response.error) {
                    throw new Error(response.error);
                } else {
                    throw new Error('Unexpected response from the server');
                }
            } catch (error) {
                console.error('Error in fetchAlternativeCarts:', error);
                if (isMounted) {
                    if (error instanceof Error) {
                        setError(error.message || 'An error occurred while comparing carts. Please try again.');
                    } else {
                        setError('An unknown error occurred while comparing carts. Please try again.');
                    }
                    setIsLoading(false);
                }
            }
        };

        fetchAlternativeCarts();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [products]);

    if (isLoading) {
        return <LoadingAnimation
            message="Comparing Products"
            submessage="Finding the best deals across different stores..."
        />;
    }

    if (error) {
        return (
            <div className="mx-4 my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            </div>
        );
    }

    const hasSavings = alternativeCarts.some(cart => {
        const originalTotal = products.reduce((total, product) => total + product.price * product.quantity, 0);
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

    return (
        <div className="pb-8 w-full min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            <h2 className="text-2xl font-bold mb-6 mt-6 text-center text-indigo-800">{headerMessage}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
                {alternativeCarts.map((cart, cartIndex) => {
                    const originalTotal = products.reduce((total, product) => total + product.price * product.quantity, 0);
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
                                                        <td className="py-1">
                                                            {product.url ? (
                                                                <a
                                                                    href={product.url}
                                                                    onClick={(e) => handleProductClick(product, product.url!, e)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-indigo-600 hover:text-indigo-800 transition-colors hover:underline"
                                                                >
                                                                    {product.productName}
                                                                </a>
                                                            ) : (
                                                                <span>{product.productName}</span>
                                                            )}
                                                        </td>
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
            <div className="mt-8 px-3 max-w-2xl">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Note about product links:</p>
                        <p>Product links will direct you to retailer websites. While we strive to link directly to products, you may occasionally need to search for specific items on the retailer's site. We're continuously improving our AI to enhance link accuracy.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareProductCarts;