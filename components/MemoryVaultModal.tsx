import React, { useState, useEffect, useRef } from 'react';
import { User, Memory } from '../types';
import { getMemoriesForUser } from '../services/memoryService';
import { CloseIcon } from './CloseIcon';
import { AppIconDarkGrey } from './AppIconDarkGrey';

interface MemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const MemoryCard: React.FC<{ memory: Memory }> = ({ memory }) => (
    <div className="bg-white/5 p-4 rounded-lg flex items-start gap-4 border border-white/10">
        <div className="w-8 h-8 flex-shrink-0 opacity-20 mt-1" aria-hidden="true">
            <AppIconDarkGrey />
        </div>
        <p className="text-slate-300 text-base">{memory.preview}</p>
    </div>
);

export const MemoryVaultModal: React.FC<MemoryVaultModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && currentUser) {
            setIsLoading(true);
            getMemoriesForUser(currentUser.hash)
                .then(setMemories)
                .finally(() => setIsLoading(false));
            
            closeButtonRef.current?.focus();
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center text-slate-400 py-8" role="status">
                    <p className="font-bold text-lg">ACCESSING MEMORY CORE...</p>
                </div>
            );
        }

        if (memories.length > 0) {
            return memories.map(memory => <MemoryCard key={memory.id} memory={memory} />);
        }

        return (
            <div className="text-center text-slate-400 py-8">
                <p className="font-bold text-lg">MEMORY VAULT IS EMPTY.</p>
                <p className="text-base mt-1">NO CORE MEMORIES FOUND.</p>
            </div>
        );
    };

    return (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-vault-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 id="memory-vault-title" className="font-heading text-xl text-white">Memory Vault</h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors btn-radiate-glow"
                            aria-label="Close memory vault"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 smooth-scroll">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};