import React from 'react';

interface AppearanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    textZoom: number;
    onTextZoomChange: (zoom: number) => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

const themes = [
    { id: 'theme-default', name: 'Grape Galaxy', color: 'bg-nexusPurple-600' },
    { id: 'theme-crimson', name: 'Crimson Hell', color: 'bg-red-600' },
    { id: 'theme-aurora', name: 'Aurora Borealis', color: 'bg-teal-600' },
    { id: 'theme-forest', name: 'Dark Forest', color: 'bg-green-600' },
    { id: 'theme-stargaze', name: 'Stargaze', color: 'bg-sky-600' },
    { id: 'theme-hightimes', name: 'Emerald Haze', color: 'bg-emerald-500' },
];

export const AppearanceModal: React.FC<AppearanceModalProps> = ({ isOpen, onClose, textZoom, onTextZoomChange, currentTheme, onThemeChange }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] flex flex-col transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl text-white">Appearance</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close appearance settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-6 flex-1">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="text-zoom" className="text-base font-medium text-gray-300">Text Size</label>
                            <span className="text-base font-mono text-gray-400">{textZoom}%</span>
                        </div>
                        <input
                            id="text-zoom"
                            type="range"
                            min="80"
                            max="150"
                            step="10"
                            value={textZoom}
                            onChange={(e) => onTextZoomChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
                        />
                    </div>
                    <div>
                         <p className="text-base font-medium text-gray-300 mb-2">Chat Theme</p>
                         <div className="grid grid-cols-2 gap-2">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => onThemeChange(theme.id)}
                                    className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${currentTheme === theme.id ? 'bg-white/10 ring-2 ring-nexusPurple-500' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    <span className={`w-4 h-4 rounded-full ${theme.color}`}></span>
                                    <span className="font-medium text-white">{theme.name}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};