import React, { useState, ChangeEvent, FormEvent } from 'react';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Update the schema to include card_expiration
const schema = z.object({
    description: z.string().min(1, "Description is required"),
    limit: z.string().min(1, "Limit is required").regex(/^\d+$/, "Limit must be a number"),
    voucher_name: z.string().min(1, "Voucher name is required"),
    card_expiration: z.date().min(new Date(), "Expiration date must be in the future"),
});

// Update the type for FormData
type FormData = z.infer<typeof schema>;

// The rest of the types remain the same
type FormError = z.ZodFormattedError<FormData> | string | null;

interface CreateCardFormProps {
    onBack: () => void;
}

export default function CreateCardForm({ onBack }: CreateCardFormProps) {
    const [formData, setFormData] = useState<FormData>({
        description: '',
        limit: '',
        voucher_name: '',
        card_expiration: new Date(),
    });
    const [error, setError] = useState<FormError>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleDateChange = (date: Date | null) => {
        setFormData(prevData => ({
            ...prevData,
            card_expiration: date || new Date()
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const validatedData = schema.parse(formData);
            chrome.runtime.sendMessage({ action: "createCard", data: validatedData }, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    setFormData({
                        description: '',
                        limit: '',
                        voucher_name: '',
                        card_expiration: new Date(),
                    });
                    setError(null);
                } else {
                    setError(response.error || "An error occurred");
                }
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.format() as z.ZodFormattedError<FormData>);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <form className="py-6 px-6 w-[90vw]" onSubmit={handleSubmit}>
            <div className="flex items-center mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>
            </div>
            <div className="mb-8">
                <label htmlFor="description" className="block text-lg font-semibold text-blue-900 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    className="input w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter card description"
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-6">
                <label htmlFor="limit" className="block text-lg font-semibold text-blue-900 mb-1">
                    Limit
                </label>
                <input
                    id="limit"
                    className="input w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter limit amount"
                    type="number"
                    name="limit"
                    required
                    value={formData.limit}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-6">
                <label htmlFor="voucher_name" className="block text-lg font-semibold text-blue-900 mb-1">
                    Card Name
                </label>
                <input
                    id="voucher_name"
                    className="input w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter voucher name"
                    type="text"
                    name="voucher_name"
                    required
                    value={formData.voucher_name}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-6">
                <label htmlFor="card_expiration" className="block text-lg font-semibold text-blue-900 mb-1">
                    Card Expiration
                </label>
                <DatePicker
                    id="card_expiration"
                    selected={formData.card_expiration}
                    onChange={handleDateChange}
                    className="input w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                    dateFormat="MM/dd/yyyy"
                    minDate={new Date()}
                    placeholderText="Select expiration date"
                />
            </div>
            <button className="button w-full bg-blue-500 text-white py-1 px-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" type="submit">
                <span className="buttonText font-medium">Create Card</span>
            </button>
            {displayErrors(error)}
        </form>
    );
}

const displayErrors = (error: FormError): React.ReactNode => {
    if (!error) return null;

    if (typeof error === 'string') {
        return <p className="error font-regular relative mt-2 px-4 pb-2 pt-2 block w-full rounded-sm text-base leading-5 text-white opacity-100">{error}</p>;
    }

    return (
        <div className="error font-regular relative mb-4 block w-full rounded-lgp-1 text-base leading-5 text-white opacity-100">
            {Object.entries(error).map(([field, fieldErrors]) => {
                if (fieldErrors && typeof fieldErrors === 'object' && 'message' in fieldErrors) {
                    return <p key={field}>* {fieldErrors.message as string}</p>;
                }
                if (Array.isArray(fieldErrors)) {
                    return <p key={field}>* {fieldErrors.join(", ")}</p>;
                }
                return null;
            })}
        </div>
    );
};