import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, X } from 'lucide-react';

interface SendEmailModalProps {
    invoiceId: string;
    isOpen: boolean;
    onClose: () => void;
    defaultEmail?: string;
}

export function SendEmailModal({ invoiceId, isOpen, onClose, defaultEmail = '' }: SendEmailModalProps) {
    const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientEmail || !invoiceId) return;

        setIsLoading(true);
        try {
            // Logged-in state is tracked by the presence of the cached user
            // profile (the JWT itself now lives in an httpOnly cookie that JS
            // cannot read).
            const isGuestOrPublic = !window.localStorage.getItem('invoice-generator-current-user');
            // If the user isn't fully authenticated, they might be using the public endpoint. 
            // But we built /api/invoices/send-email which assumes auth. 
            // We also built /api/public/send-copy for guests.

            const endpoint = isGuestOrPublic ? '/api/public/send-copy' : '/api/invoices/send-email';
            const payload = isGuestOrPublic
                ? { invoiceId, email: recipientEmail, subscribeToBrevo: true }
                : { invoiceId, recipientEmail, message };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success('Invoice sent successfully!');
                setRecipientEmail('');
                setMessage('');
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to send invoice email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all" style={{ margin: 0 }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Send Invoice</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSendEmail} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                            type="email"
                            required
                            placeholder="client@example.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                        <textarea
                            placeholder="Here is your invoice for our recent project..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !recipientEmail}
                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 inline-flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" /> Send Email
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
