import React from 'react';
import { HistoryIcon } from './HistoryIcon';
import { LogoutIcon } from './LogoutIcon';
import { PaintBrushIcon } from './PaintBrushIcon';
import { SpeakerWaveIcon } from './SpeakerWaveIcon';
import { SwitchIcon } from './SwitchIcon';

interface MenuProps {
  onLogout: () => void;
  onViewHistory: () => void;
  currentAiModel: string;
  onSelectAiModel: (model: string) => void;
  onOpenAppearance: () => void;
  onOpenVoiceSelection: () => void;
  onOpenModeSelection: () => void;
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
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
            isDestructive 
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-gray-300 hover:bg-white/10'
        }`}
    >
        {icon}
        <span className="font-medium text-base">{text}</span>
    </button>
);

export const Menu: React.FC<MenuProps> = ({ 
    onLogout, 
    onViewHistory, 
    currentAiModel, 
    onSelectAiModel, 
    onOpenAppearance,
    onOpenVoiceSelection,
    onOpenModeSelection,
}) => {
    return (
        <div className="absolute top-20 left-4 w-64 bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl backdrop-blur-xl z-30 overflow-hidden menu-slide-in transition-colors duration-500">
            <div className="p-2 space-y-1">
                <div className="px-2 pt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Brain</p>
                    <div className="mt-2 flex items-center bg-black/20 rounded-lg p-1">
                        {aiModels.map(model => (
                            <button
                                key={model.id}
                                onClick={() => onSelectAiModel(model.id)}
                                className={`w-1/2 px-2 py-1 text-sm font-semibold rounded-md transition-colors ${currentAiModel === model.id ? 'bg-nexusPurple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="pt-2">
                    <MenuItem icon={<PaintBrushIcon />} text="Appearance" onClick={onOpenAppearance} />
                    <MenuItem icon={<SpeakerWaveIcon />} text="Voice" onClick={onOpenVoiceSelection} />
                    <MenuItem icon={<SwitchIcon />} text="Switch Vibe" onClick={onOpenModeSelection} />
                    <MenuItem icon={<HistoryIcon />} text="Chat History" onClick={onViewHistory} />
                </div>
            </div>
            <div className="border-t border-white/10 p-2">
                <MenuItem icon={<LogoutIcon />} text="Logout" onClick={onLogout} isDestructive />
            </div>
        </div>
    );
};