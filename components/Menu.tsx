import React from 'react';
import { HistoryIcon } from './HistoryIcon';
import { LogoutIcon } from './LogoutIcon';
import { PaintBrushIcon } from './PaintBrushIcon';
import { SpeakerWaveIcon } from './SpeakerWaveIcon';
import { SwitchIcon } from './SwitchIcon';
import { Avatar } from './Avatar';
import { AppIcon } from './AppIcon';
import { CloseIcon } from './CloseIcon';
import { EditProfileIcon } from './EditProfileIcon';
import { VaultIcon } from './VaultIcon';
import type { User } from '../types';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onViewHistory: () => void;
  currentAiModel: string;
  onSelectAiModel: (model: string) => void;
  onOpenAppearance: () => void;
  onOpenVoiceSelection: () => void;
  onOpenModeSelection: () => void;
  currentUser: User;
  onGoToAuth: () => void;
  onOpenProfileModal: () => void;
  onOpenMemoryVault: () => void;
}

const aiModels = [
    { id: 'gemini-2.5-pro', name: 'DAREN Pro' },
    { id: 'gemini-2.5-flash', name: 'DAREN Flash' },
];

const MenuItem: React.FC<{
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
    isDestructive?: boolean;
}> = ({ icon, text, onClick, isDestructive }) => (
    <button
        onClick={onClick}
        className={`btn-radiate-glow group w-full flex items-center gap-4 px-4 py-3 rounded-full text-left transition-colors duration-200 ${
            isDestructive 
            ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
    >
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{icon}</div>
        <span className="font-semibold text-base">{text}</span>
    </button>
);

export const Menu: React.FC<MenuProps> = ({ 
    isOpen,
    onClose,
    onLogout, 
    onViewHistory, 
    currentAiModel, 
    onSelectAiModel, 
    onOpenAppearance,
    onOpenVoiceSelection,
    onOpenModeSelection,
    currentUser,
    onGoToAuth,
    onOpenProfileModal,
    onOpenMemoryVault,
}) => {
    if (!isOpen) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20" onClick={onClose}></div>
        <div className="fixed top-0 left-0 bottom-0 w-80 bg-[var(--modal-bg)] border-r border-[var(--ui-border-color)] shadow-2xl z-30 menu-slide-in transition-colors duration-500 flex flex-col">
            
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                <div className="w-48 h-48">
                    <AppIcon />
                </div>
            </div>

            <div className="absolute top-4 right-4 z-20">
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                    <CloseIcon />
                </button>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 pt-6">
                    {currentUser.isGuest ? (
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                            <h2 className="text-xl font-bold text-white">Hey Guest!</h2>
                            <p className="text-sm text-gray-400 mt-1">Create an account to save your history and settings.</p>
                            <button 
                                onClick={onGoToAuth}
                                className="w-full mt-4 bg-nexusPurple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-nexusPurple-700 transition-colors"
                            >
                                Create Account
                            </button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-3 p-2">
                            <Avatar name={currentUser.name || currentUser.email} />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold text-white truncate">Hey {currentUser.name || currentUser.email.split('@')[0]}!</h2>
                            </div>
                            <button onClick={onOpenProfileModal} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                <EditProfileIcon />
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Brain</p>
                    <div className="flex items-center bg-black/20 rounded-full p-1">
                        {aiModels.map(model => (
                            <button
                                key={model.id}
                                onClick={() => onSelectAiModel(model.id)}
                                className={`btn-radiate-glow w-1/2 px-2 py-1.5 text-sm font-semibold rounded-full transition-colors ${currentAiModel === model.id ? 'bg-nexusPurple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                    <MenuItem icon={<PaintBrushIcon />} text="Appearance" onClick={onOpenAppearance} />
                    <MenuItem icon={<SpeakerWaveIcon />} text="Voice" onClick={onOpenVoiceSelection} />
                    <MenuItem icon={<SwitchIcon />} text="Switch Vibe" onClick={onOpenModeSelection} />
                    <MenuItem icon={<HistoryIcon />} text="Chat History" onClick={onViewHistory} />
                    <MenuItem icon={<VaultIcon />} text="Memory Vault" onClick={onOpenMemoryVault} />
                </div>
                <div className="p-4 mt-auto">
                    <MenuItem icon={<LogoutIcon />} text="Logout" onClick={onLogout} isDestructive />
                </div>
            </div>
        </div>
      </>
    );
};
