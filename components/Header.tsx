import React, { useState, useRef, useEffect } from 'react';
import { HamburgerIcon } from './HamburgerIcon';
import { PencilIcon } from './PencilIcon';
import { BackArrowIcon } from './BackArrowIcon';
import { BugIcon } from './BugIcon';
import { ChevronDownIcon } from './ChevronDownIcon';

interface HeaderProps {
    onToggleMenu: () => void;
    onNewChat: () => void;
    showHomeScreen: boolean;
    onGoHome: () => void;
    onOpenBugModal: () => void;
    currentMode: string;
    onModeChange: (mode: string) => void;
}

const modes = [
    { icon: '💯', text: 'Real Talk' },
    { icon: '🔥', text: 'Fuck-It' },
    { icon: '🧠', text: 'Deep Dive' },
    { icon: '😈', text: 'Frisky' },
];

export const Header: React.FC<HeaderProps> = ({ 
    onToggleMenu, 
    onNewChat, 
    showHomeScreen,
    onGoHome,
    onOpenBugModal,
    currentMode,
    onModeChange,
}) => {
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentModeIcon = modes.find(m => m.text === currentMode)?.icon || '💯';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsModeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
    <header className={`p-4 z-20 flex items-center justify-between flex-shrink-0 transition-colors duration-500 ${!showHomeScreen ? 'bg-[var(--ui-bg-tint)] backdrop-blur-lg border-b border-[var(--ui-border-color)]' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2">
            {!showHomeScreen && (
                 <button 
                    onClick={onGoHome}
                    className="p-1 -ml-1 text-white opacity-50 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color-dark)] focus:ring-nexusPurple-500 rounded-md"
                    aria-label="Go back"
                >
                    <BackArrowIcon />
                </button>
            )}
            <button 
                onClick={onToggleMenu}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color-dark)] focus:ring-nexusPurple-500"
                aria-label="Toggle menu"
            >
                <HamburgerIcon />
            </button>
        </div>

        {!showHomeScreen && (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card-bg)] rounded-full border border-white/10 hover:bg-[var(--card-hover-bg)] transition-colors"
                >
                    <span className="text-xl">{currentModeIcon}</span>
                    <span className="font-semibold text-white">{currentMode}</span>
                    <ChevronDownIcon isOpen={isModeDropdownOpen} />
                </button>
                {isModeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-40 animate-fade-in">
                        <ul className="p-1">
                            {modes.map(mode => (
                                <li key={mode.text}>
                                    <button
                                        onClick={() => {
                                            onModeChange(mode.text);
                                            setIsModeDropdownOpen(false);
                                        }}
                                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
                                    >
                                        <span className="text-xl">{mode.icon}</span>
                                        <span className="font-medium text-white">{mode.text}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}

        <div className="flex items-center gap-2">
            <button
                onClick={onOpenBugModal}
                className="w-10 h-10 flex items-center justify-center bg-[var(--card-bg)] rounded-full text-lg hover:opacity-80 transition-opacity duration-200 border border-amber-600/80"
                aria-label="Report a bug"
            >
               <BugIcon />
            </button>
            <button
                onClick={onNewChat}
                className="w-10 h-10 flex items-center justify-center bg-[var(--card-bg)] rounded-full text-purple-400 hover:opacity-80 transition-opacity duration-200 border border-purple-400/80"
                aria-label="New chat"
            >
                <PencilIcon />
            </button>
        </div>
    </header>
  );
};