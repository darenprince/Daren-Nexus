import React, { useState, useRef, useEffect } from 'react';
import { HamburgerIcon } from './HamburgerIcon';
import { PencilIcon } from './PencilIcon';
import { BackArrowIcon } from './BackArrowIcon';
import { BugIcon } from './BugIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { AppIcon } from './AppIcon';

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
    { icon: '✌️', text: 'Vibing' },
    { icon: '💯', text: 'Real Talk' },
    { icon: '🔥', text: 'Fuck It' },
    { icon: '🧠', text: 'Deep Dive' },
    { icon: '🧭', text: 'Mentor Mode' },
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

    const currentModeIcon = modes.find(m => m.text === currentMode)?.icon || '✌️';

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
    <header className={`relative p-4 z-20 flex items-center justify-between flex-shrink-0 transition-colors duration-500 ${!showHomeScreen ? 'bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'}`}>
        {/* Left Aligned Items */}
        <div className="flex items-center gap-2">
            {!showHomeScreen && (
                 <button 
                    onClick={onGoHome}
                    className="btn-radiate-glow w-8 h-8 flex items-center justify-center text-white opacity-50 hover:opacity-100 transition-opacity duration-200 rounded-md group"
                    aria-label="Go back"
                >
                    <div className="group-hover:animate-wiggle-on-hover"><BackArrowIcon /></div>
                </button>
            )}
            <button 
                onClick={onToggleMenu}
                className="btn-radiate-glow w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity duration-200 group"
                aria-label="Toggle menu"
            >
                <div className="group-hover:animate-wiggle-on-hover w-full h-full"><HamburgerIcon /></div>
            </button>
        </div>

        {/* Center Aligned Items (Title or Mode Dropdown) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {!showHomeScreen && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                        className="btn-radiate-glow flex items-center gap-2 px-4 h-10 bg-[var(--card-bg)] rounded-full border border-white/10 hover:bg-[var(--card-hover-bg)] transition-colors"
                    >
                        <span className="text-lg">{currentModeIcon}</span>
                        <span className="font-semibold text-white text-sm">{currentMode}</span>
                        <ChevronDownIcon isOpen={isModeDropdownOpen} />
                    </button>
                    {isModeDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-40 animate-fade-in">
                            <ul className="p-1">
                                {modes.map(mode => (
                                    <li key={mode.text}>
                                        <button
                                            onClick={() => {
                                                onModeChange(mode.text);
                                                setIsModeDropdownOpen(false);
                                            }}
                                            className="btn-radiate-glow w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
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
        </div>

        {/* Right Aligned Items */}
        <div className="flex items-center gap-2">
            <div className="p-[1.5px] bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                <button
                    onClick={onOpenBugModal}
                    className="btn-radiate-glow group w-8 h-8 flex items-center justify-center bg-[var(--card-bg)] rounded-full hover:opacity-80 transition-opacity duration-200"
                    aria-label="Report a bug"
                >
                   <div className="group-hover:animate-wiggle-on-hover">
                       <BugIcon />
                    </div>
                </button>
            </div>
            <div className="p-[1.5px] bg-gradient-to-r from-nexusPurple-500 to-nexusPurple-700 rounded-full">
                <button
                    onClick={onNewChat}
                    className="btn-radiate-glow group w-8 h-8 flex items-center justify-center bg-[var(--card-bg)] rounded-full hover:opacity-80 transition-opacity duration-200"
                    aria-label="New chat"
                >
                    <div className="group-hover:animate-wiggle-on-hover">
                        <PencilIcon />
                    </div>
                </button>
            </div>
        </div>
    </header>
  );
};