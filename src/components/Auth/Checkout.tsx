import React from 'react';

interface CheckoutProps {
    onCompare: () => void;
    total: number;
}

export const Compare: React.FC<CheckoutProps> = ({
    onCompare,
    total
}) => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200">
            <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-600 font-medium">Total</span>
                    <span className="text-sm font-bold text-gray-800">R {total.toFixed(2)}</span>
                </div>
                <button
                    onClick={onCompare}
                    className="bg-blue-600 text-base hover:bg-blue-700 text-white font-semibold py-2 px-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md w-[150px]"
                >
                    Compare
                </button>
            </div>
        </div>
    );
};