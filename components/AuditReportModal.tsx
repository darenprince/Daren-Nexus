import React, { useRef, useEffect, useState } from 'react';
import { CloseIcon } from './CloseIcon';
import { CheckIcon } from './CheckIcon';

interface AuditReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    auditText: string;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose, auditText }) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            closeButtonRef.current?.focus();
            setCopySuccess(false); // Reset on open
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(auditText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
        }, (err) => {
            console.error('Failed to copy audit text: ', err);
        });
    };

    return (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-report-title"
        >
            <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex-shrink-0 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 id="audit-report-title" className="text-lg font-semibold text-white">Nexus Who - Audit Report</h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close audit report"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{auditText}</pre>
                </div>
                <div className="p-4 flex-shrink-0 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleCopy}
                        className="relative bg-nexusPurple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-nexusPurple-700 transition-colors flex items-center gap-2"
                    >
                        {copySuccess ? (
                            <span className="animate-copy-confirm"><CheckIcon /></span>
                        ) : 'Copy to Clipboard'}
                    </button>
                </div>
            </div>
        </div>
    );
};