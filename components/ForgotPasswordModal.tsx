import React, { useState } from 'react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger a backend service to send a reset email.
        // Here, we'll just simulate the success state.
        console.log(`Password reset requested for: ${email}`);
        setIsSubmitted(true);
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {!isSubmitted ? (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4">Forgot Password</h2>
                        <p className="text-slate-300 mb-6">Enter your email and we'll (pretend to) send you a link to reset your password.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                required
                                className="w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-nexusPurple-500 focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
                            />
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity"
                            >
                                Send Reset Link
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-green-400 mb-4">Check Your Email</h2>
                        <p className="text-slate-300 mb-6">If an account with that email exists, a password reset link has been sent. (This is a simulation, so you can just close this window now.)</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20 transition-colors"
                        >
                            Got It
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};