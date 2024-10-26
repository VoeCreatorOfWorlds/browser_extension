import React, { useState, useEffect } from 'react';
import { getCart } from '../../services/cartService';
import CompareProductCarts from '../CartCompare/CartCompare';
import { CartProduct } from '../../types';
import { AlertCircle } from 'lucide-react';
import { LoadingAnimation } from '../Loading/LoadingAnimation';

interface CartResponse {
    cartProducts: CartProduct[];
}

interface CartContentsProps {
    cartDescription: string;
}

const CartContents: React.FC<CartContentsProps> = ({ cartDescription }) => {
    console.log('CartContents called with:', { cartDescription });
    const [cartItems, setCartItems] = useState<CartProduct[]>([]);
    const [loadingStage, setLoadingStage] = useState<'extracting' | 'comparing' | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCartContents = async () => {
            if (!cartDescription.trim()) {
                setCartItems([]);
                setError(null);
                return;
            }

            setLoadingStage('extracting');

            try {
                const response: CartResponse = await getCart(cartDescription);
                setCartItems(response.cartProducts);
                setLoadingStage('comparing');
                setError(null);
            } catch (err) {
                setError('Failed to fetch cart contents. Please try again.');
                setLoadingStage(null);
            }
        };

        fetchCartContents();
    }, [cartDescription]);

    if (loadingStage === 'extracting') {
        return (
            <LoadingAnimation
                message="Processing Cart Data"
                submessage="Extracting product information..."
            />
        );
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

    if (!cartItems.length) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-sm text-gray-500">No items found in cart.</p>
            </div>
        );
    }

    if (loadingStage === 'comparing') {
        return (
            <CompareProductCarts products={cartItems} />
        );
    }
};


export default CartContents;