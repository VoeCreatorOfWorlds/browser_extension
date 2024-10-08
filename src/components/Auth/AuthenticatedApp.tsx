import React from "react";
import Header from "../Header/header";
import { Router } from "../Router/route";
import { useOnboardingFlow } from "../../hooks/useOnboardingFlow";
import DocumentUploadLink from "../Onboarding/uploadScreen";
import { KycStep } from "../../types";
import { FileText, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { UnauthorizedErrorBoundary } from "./ErrorBoundary";

const AuthenticatedAppContent: React.FC = () => {
    const { currentStep, isComplete, loading } = useOnboardingFlow();

    if (loading) {
        return (
            <div className="flex items-center justify-center w-[100%] h-[100%] pt-24">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="flex items-start justify-center w-[100%] h-[100%] pt-24">
                {!isComplete ? <Router /> : renderStepContent(currentStep)}
            </div>
        </>
    );
};

const AuthenticatedApp: React.FC = () => {
    return (
        <UnauthorizedErrorBoundary>
            <AuthenticatedAppContent />
        </UnauthorizedErrorBoundary>
    );
};

const renderStepContent = (step: KycStep) => {
    console.log("kyc step: ", step)
    switch (step) {
        case 'not_started':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">Welcome to our KYC Process</h2>
                    <p className="text-gray-600 mb-6">To get started, please click the button below to begin your KYC verification.</p>
                    <button
                        onClick={() => { /* Logic to start KYC process */ }}
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-semibold transition duration-150 ease-in-out"
                    >
                        Start KYC Process
                    </button>
                </div>
            );
        case 'user_kyc_start':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">Individual KYC</h2>
                    <p className="text-gray-600 mb-6">Please upload your personal identification documents.</p>
                    <DocumentUploadLink uploadUrl="/api/user-kyc-upload" />
                </div>
            );
        case 'business_kyc_start':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">Business KYC</h2>
                    <p className="text-gray-600 mb-6">Please upload your business verification documents.</p>
                    <DocumentUploadLink uploadUrl="/api/business-kyc-upload" />
                </div>
            );
        case 'user_kyc_pending':
        case 'business_kyc_pending':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">KYC Under Review</h2>
                    <div className="flex justify-center mb-6">
                        <FileText size={48} className="text-indigo-600" />
                    </div>
                    <p className="text-gray-600">Your KYC documents are being reviewed. This process typically takes 1-3 business days. Please check back later.</p>
                </div>
            );
        case 'user_kyc_resubmit':
        case 'business_kyc_resubmit':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">KYC Resubmission Required</h2>
                    <div className="flex justify-center mb-6">
                        <AlertCircle size={48} className="text-red-600" />
                    </div>
                    <p className="text-gray-600 mb-6">Your KYC was not approved. Please resubmit your documents, ensuring they meet our guidelines.</p>
                    <DocumentUploadLink uploadUrl="/api/kyc-resubmit" />
                </div>
            );
        case 'verification_in_progress':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">Verification in Progress</h2>
                    <div className="flex justify-center mb-6">
                        <Upload size={48} className="text-indigo-600" />
                    </div>
                    <p className="text-gray-600">Your documents have been uploaded and are being verified. This process may take up to 24 hours. We'll notify you once the verification is complete.</p>
                </div>
            );
        case 'complete':
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">KYC Completed</h2>
                    <div className="flex justify-center mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <p className="text-gray-600">Your KYC process is complete. You now have full access to our platform.</p>
                </div>
            );
        case 'error':
        default:
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <div className="flex justify-center mb-6">
                        <AlertCircle size={48} className="text-red-600" />
                    </div>
                    <p className="text-gray-600 mb-6">An error occurred during the KYC process. Please try again later or contact our support team for assistance.</p>
                    <button
                        onClick={() => { /* Logic to contact support */ }}
                        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-semibold transition duration-150 ease-in-out"
                    >
                        Contact Support
                    </button>
                </div>
            );
    }
};

export { AuthenticatedApp };