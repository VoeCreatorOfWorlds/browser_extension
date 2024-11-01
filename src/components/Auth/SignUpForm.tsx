import React, { useState, useCallback } from 'react';
import { Mail, Lock, Phone } from 'lucide-react';
import { Link } from '../Router/route';

interface SignupFormProps {
    onSignup: (formData: any) => Promise<void>;
    isLoading: boolean;
}

interface ValidationErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    contactNumber?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, isLoading }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
    });
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    React.useEffect(() => {
        setIsVisible(true);
    }, []);

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Contact number validation
        if (!formData.contactNumber) {
            errors.contactNumber = 'Contact number is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Clear validation error for the field being edited
        setValidationErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
    };

    const handleSignup = useCallback(async () => {
        setError(null);

        if (!validateForm()) {
            return;
        }

        // Remove confirmPassword before sending to API
        const { confirmPassword, ...dataToSubmit } = formData;

        try {
            await onSignup(dataToSubmit);
            setSignupSuccess(true);
        } catch (error) {
            setError('Signup failed. Please try again.');
        }
    }, [formData, onSignup]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div
                className={`w-full max-w-md bg-white p-8 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
            >
                <div className="flex flex-col items-center justify-center mb-8">
                    <img src="logo.png" alt="BuyBook Logo" className="w-24 h-24 mb-4 rounded-full shadow-md" />
                    <h1 className="text-3xl font-bold text-indigo-600">BuyBook</h1>
                    <p className="text-sm text-gray-600">Smart 1-Click checkout</p>
                </div>
                {!signupSuccess ? (
                    <div className="space-y-6">
                        <InputField
                            icon={<Mail size={20} />}
                            placeholder="Email address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={validationErrors.email}
                        />
                        <InputField
                            icon={<Lock size={20} />}
                            placeholder="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={validationErrors.password}
                        />
                        <InputField
                            icon={<Lock size={20} />}
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            error={validationErrors.confirmPassword}
                        />
                        <InputField
                            icon={<Phone size={20} />}
                            placeholder="Contact Number"
                            name="contactNumber"
                            type="tel"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            error={validationErrors.contactNumber}
                        />
                        <button
                            onClick={handleSignup}
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-semibold transition duration-150 ease-in-out disabled:opacity-50"
                        >
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-green-600 font-semibold">
                        Signup successful!
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

interface InputFieldProps {
    icon: React.ReactElement;
    placeholder: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    icon,
    placeholder,
    name,
    value,
    onChange,
    type = "text",
    error
}) => (
    <div className="space-y-1">
        <div className="relative">
            <div className="absolute top-3 left-3 text-gray-400">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
            />
        </div>
        {error && (
            <p className="text-red-500 text-sm">{error}</p>
        )}
    </div>
);

export default SignupForm;