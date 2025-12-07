import React, { useState, useEffect, useRef } from 'react';
import { getSavedSessions } from '../services/chatHistoryService';
import type { Message, ChatSession, User } from '../types';
import { CloseIcon } from './CloseIcon';

interface ChatHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSession: (messages: Message[]) => void;
    currentUser: User;
    onSignUp: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ isOpen, onClose, onSelectSession, currentUser, onSignUp }) => {
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const closeButtonRef = useRef<HTMLButtonElement>(null);


    useEffect(() => {
        if (isOpen && currentUser && !currentUser.isGuest) {
            setIsLoading(true);
            getSavedSessions(currentUser.hash)
                .then(sessions => {
                    setHistory(sessions);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Failed to load chat history:", error);
                    setIsLoading(false);
                });
        } else if (currentUser?.isGuest) {
            setIsLoading(false);
            setHistory([]);
        }
    }, [isOpen, currentUser]);

    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            // Focus the close button for accessibility when the modal opens.
            closeButtonRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (currentUser.isGuest) {
            return (
                <div className="text-center text-slate-400 py-8 px-4">
                    <p className="text-3xl mb-4" aria-hidden="true">💾</p>
                    <p className="font-bold text-lg text-white">SAVE YOUR CONVERSATIONS</p>
                    <p className="text-base mt-2 mb-6">Create a free account to save and access your chat history across sessions.</p>
                    <button 
                        onClick={onSignUp}
                        className="w-full bg-nexusPurple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-nexusPurple-700 transition-colors"
                    >
                        Sign Up Now
                    </button>
                </div>
            );
        }

        if (isLoading) {
             return (
                <div className="text-center text-slate-400 py-8" role="status">
                    <p className="font-bold text-lg">LOADING HISTORY...</p>
                </div>
            );
        }
        
        if (history.length > 0) {
            return (
                <ul className="space-y-2">
                    {history.map(session => (
                        <li key={session.id}>
                            <button 
                                className="w-full bg-white/5 p-3 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer text-left"
                                onClick={() => onSelectSession(session.messages)}
                            >
                                <p className="font-bold text-slate-200 truncate text-lg">{session.summary}</p>
                                <p className="text-base text-slate-400">{session.timestamp}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            );
        }

        return (
            <div className="text-center text-slate-400 py-8">
                <p className="font-bold text-lg">NO CHAT HISTORY FOUND.</p>
                <p className="text-base mt-1">START A CONVERSATION TO SEE IT HERE.</p>
            </div>
        );
    };

    return (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-history-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 id="chat-history-title" className="font-heading text-xl text-white">Chat History</h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors btn-radiate-glow"
                            aria-label="Close chat history"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 smooth-scroll">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};