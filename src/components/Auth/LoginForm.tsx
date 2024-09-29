import React, { useState } from 'react';
import { Link } from '../Router/route';

interface LoginFormProps {
    onLogin: (email: string, password: string) => Promise<void>;
    isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="flex flex-col items-center justify-center h-[100vh]">
            <div className="w-full h-[100%] p-8 flex flex-col items-center justify-center">
                <div className="flex flex-row items-start justify-center mb-8">
                    <img src="logo.png" alt="BuyBook Logo" className="w-16 h-fit mr-4 rounded-md" />
                    <div>
                        <h1 className="text-2xl font-bold text-blue-600">BuyBook</h1>
                        <p className="text-sm text-gray-600">Smart 1-Click checkout</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline font-semibold">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;