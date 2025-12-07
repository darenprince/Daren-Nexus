import React, { useRef, useEffect } from 'react';
import { CloseIcon } from './CloseIcon';

interface BugReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-report-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] flex flex-col text-center transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 id="bug-report-title" className="font-heading text-xl text-white">Something Fucked Up?</h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 flex flex-col items-center justify-center">
                    <p className="text-4xl" aria-hidden="true">🛠️</p>
                    <p className="text-slate-300 max-w-sm text-lg">
                       Look, shit breaks. If the Nexus is acting weird, let me know. No fluff, just tell me what happened so I can get my hands dirty and fix it. Every report helps keep this connection clean.
                    </p>
                    <a 
                        href="mailto:darenprince@gmail.com?subject=The Daren Nexus - Bug Report"
                        className="inline-block bg-nexusPurple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-nexusPurple-700 transition-colors duration-200 mt-4"
                    >
                        Send the Details
                    </a>
                </div>
            </div>
        </div>
    );
};