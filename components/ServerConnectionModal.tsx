import React, { useRef, useEffect, useState } from 'react';
import { CloseIcon } from './CloseIcon';

interface ServerConnectionModalProps {
    onRetry: () => void;
}

export const ServerConnectionModal: React.FC<ServerConnectionModalProps> = ({ onRetry }) => {
    const retryButtonRef = useRef<HTMLButtonElement>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        retryButtonRef.current?.focus();
    }, []);

    const handleRetryClick = () => {
        setIsRetrying(true);
        // Add a small delay to give user feedback before the network request
        setTimeout(() => {
            onRetry();
            // The parent component will handle removing this modal on success.
            // If it fails again, the parent will keep it open, so we should reset our state.
            setTimeout(() => setIsRetrying(false), 1000);
        }, 500);
    }

    return (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="server-connection-title"
          aria-describedby="server-connection-description"
        >
            <div 
                className="bg-[var(--modal-bg)] border border-red-500/50 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                <div className="w-16 h-16 mx-auto mb-4 text-red-500 border-4 border-red-500/50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364" />
                    </svg>
                </div>

                <h2 id="server-connection-title" className="text-2xl font-bold text-white mb-4">
                    Server Connection Failed
                </h2>
                <div id="server-connection-description" className="text-slate-300 text-lg space-y-4">
                    <p>
                        The Daren Nexus app now requires a local server to run. It seems I can't connect to it right now.
                    </p>
                    <p className="bg-white/5 p-3 rounded-lg text-slate-400">
                        Please make sure you have started the server by following the instructions in the <code className="bg-black/50 px-1 py-0.5 rounded text-orange-400">README.md</code> file, then click Retry.
                    </p>
                </div>
                <button
                    ref={retryButtonRef}
                    onClick={handleRetryClick}
                    disabled={isRetrying}
                    className="w-full mt-8 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full transition-opacity hover:opacity-90 text-lg disabled:opacity-50 disabled:cursor-wait"
                >
                    {isRetrying ? 'Retrying...' : 'Retry Connection'}
                </button>
            </div>
        </div>
    );
};