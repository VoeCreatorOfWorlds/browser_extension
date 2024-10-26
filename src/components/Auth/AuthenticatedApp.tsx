import React from "react";
import Header from "../Header/header";
import { Router } from "../Router/route";
import { UnauthorizedErrorBoundary } from "./ErrorBoundary";

const AuthenticatedAppContent: React.FC = () => {

    return (
        <>
            <Header />
            <div className="flex items-start justify-center w-[100%] h-[100%] pt-24">
                <Router />
            </div>
        </>
    )
};

const AuthenticatedApp: React.FC = () => {
    return (
        <UnauthorizedErrorBoundary>
            <AuthenticatedAppContent />
        </UnauthorizedErrorBoundary>
    );
};
export { AuthenticatedApp };