import React from 'react';
import { Check } from 'lucide-react';

export const ConfirmPaymentButton: React.FC = () => {
    return (
        <button id="confirmPayment">
            Pay with Buy Book <Check size={16} />
        </button>
    );
};