import React, { useRef, useEffect } from 'react';
import { ModeTiles } from './ModeTiles';
import { CloseIcon } from './CloseIcon';

interface ModeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: (mode: string) => void;
    currentMode: string;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ isOpen, onClose, onSelectMode, currentMode }) => {
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
          aria-labelledby="mode-selection-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 id="mode-selection-title" className="font-heading text-xl text-white">Switch Vibe</h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close mode selection"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <ModeTiles onSelectMode={onSelectMode} currentMode={currentMode} selectedModeForAnimation={null} />
                </div>
            </div>
        </div>
    );
};