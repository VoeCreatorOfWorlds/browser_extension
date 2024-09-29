import React, { useState, useCallback } from 'react';
import { Briefcase, Mail, Lock, Phone, Calendar, FileText, Upload } from 'lucide-react';
import { Link } from '../Router/route';

interface SignupFormProps {
    onSignup: (formData: any) => Promise<void>;
    isLoading: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, isLoading }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        contactNumber: '',
        businessName: '',
        businessAddress: '',
        businessType: '',
        businessRegistrationNumber: '',
        businessRegistrationDate: '',
    });
    const [isBusiness, setIsBusiness] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSignup = useCallback(async () => {
        console.log("Submitting form", formData);
        setError(null);

        const dataToSubmit = {
            ...formData,
            is_business: isBusiness
        };

        try {
            await onSignup(dataToSubmit);
            setSignupSuccess(true);
            console.log("Signup successful");
        } catch (error) {
            console.error('Signup failed:', error);
            setError('Signup failed. Please try again.');
        }
    }, [formData, isBusiness, onSignup]);

    const getUploadUrl = () => {
        // This function should return the URL for your file upload page
        // You might want to include any necessary parameters, such as a session token
        return 'http://your-upload-website.com/upload';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div
                className={`w-full max-w-md bg-white p-8  transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
            >
                <div className="flex flex-col items-center justify-center mb-8">
                    < img src="logo.png" alt="BuyBook Logo" className="w-24 h-24 mb-4 rounded-full shadow-md" />
                    <h1 className="text-3xl font-bold text-indigo-600">BuyBook</h1>
                    <p className="text-sm text-gray-600">Smart 1-Click checkout</p>
                </div >
                {!signupSuccess ? (
                    <div className="space-y-6">
                        <InputField
                            icon={<Mail size={20} />}
                            placeholder="Email address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <InputField
                            icon={<Lock size={20} />}
                            placeholder="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <InputField
                            icon={<Phone size={20} />}
                            placeholder="Contact Number"
                            name="contactNumber"
                            type="tel"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                        />
                        <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isBusiness}
                                    onChange={() => setIsBusiness(!isBusiness)}
                                    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                                />
                                <span className="text-gray-700 font-medium">Sign up as a business</span>
                            </label>
                        </div>
                        <div
                            className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${isBusiness ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <InputField
                                icon={<Briefcase size={20} />}
                                placeholder="Business Name"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                            />
                            <InputField
                                icon={<FileText size={20} />}
                                placeholder="Business Address"
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleInputChange}
                            />
                            <InputField
                                icon={<Briefcase size={20} />}
                                placeholder="Business Type"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleInputChange}
                            />
                            <InputField
                                icon={<FileText size={20} />}
                                placeholder="Business Registration Number"
                                name="businessRegistrationNumber"
                                value={formData.businessRegistrationNumber}
                                onChange={handleInputChange}
                            />
                            <InputField
                                icon={<Calendar size={20} />}
                                type="date"
                                placeholder="Business Registration Date"
                                name="businessRegistrationDate"
                                value={formData.businessRegistrationDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button
                            onClick={handleSignup}
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-semibold transition duration-150 ease-in-out"
                        >
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center text-green-600 font-semibold">
                            Signup successful!
                        </div>
                        <a
                            href={getUploadUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 font-semibold transition duration-150 ease-in-out"
                        >
                            <Upload size={20} className="mr-2" />
                            Upload Required Documents
                        </a>
                    </div>
                )}

                {
                    error && (
                        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )
                }

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                        Log in
                    </Link>
                </p>
            </div >
        </div >
    );
};

interface InputFieldProps {
    icon: React.ReactElement;
    placeholder: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ icon, placeholder, name, value, onChange, type = "text" }) => (
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
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
    </div>
);

export default SignupForm;