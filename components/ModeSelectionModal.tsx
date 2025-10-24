import React from 'react';
import { ModeTiles } from './ModeTiles';

interface ModeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: (mode: string) => void;
    currentMode: string;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ isOpen, onClose, onSelectMode, currentMode }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-xl text-white">Switch Vibe</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close mode selection"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <ModeTiles onSelectMode={onSelectMode} currentMode={currentMode} />
                </div>
            </div>
        </div>
    );
};