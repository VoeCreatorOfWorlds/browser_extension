import { Loader2, ShoppingCart } from 'lucide-react';

interface LoadingAnimationProps {
    message: string;
    submessage: string;
}

export const LoadingAnimation = ({ message, submessage }: LoadingAnimationProps) => (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
        <div className="relative">
            <div className="w-16 h-16">
                <Loader2 className="w-full h-full text-indigo-500 animate-spin" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-indigo-600" />
            </div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-lg font-medium text-indigo-700">{message}</p>
            <p className="text-sm text-gray-500">{submessage}</p>
        </div>
    </div>
);