import React from 'react';
import { Upload } from 'lucide-react';

interface DocumentUploadLinkProps {
    uploadUrl: string;
    className?: string;
}

const DocumentUploadLink: React.FC<DocumentUploadLinkProps> = ({ uploadUrl, className = '' }) => {
    return (
        <a
            href={uploadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 font-semibold transition duration-150 ease-in-out ${className}`}
        >
            <Upload size={20} className="mr-2" />
            Upload Required Documents
        </a>
    );
};

export default DocumentUploadLink;