import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { CloseIcon } from './CloseIcon';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onSave: (name: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
    const [name, setName] = useState(currentUser.name || '');
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(currentUser.name || '');
            closeButtonRef.current?.focus();
        }
    }, [isOpen, currentUser.name]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(name.trim());
    };

    return (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl p-6 max-w-md w-full transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 id="profile-title" className="font-heading text-xl text-white">Edit Profile</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                        <input
                            id="profile-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-black/30 text-white placeholder:text-gray-500 border border-white/20 focus:border-nexusPurple-500 focus:ring-nexusPurple-500 rounded-lg px-4 py-2 transition-colors"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-nexusPurple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-nexusPurple-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};