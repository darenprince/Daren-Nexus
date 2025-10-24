import React from 'react';

interface ModeTilesProps {
    onSelectMode: (mode: string) => void;
    currentMode: string;
    selectedModeForAnimation: string | null;
}

const modes = [
    { icon: '✌️', text: 'Vibing', description: 'Chill, friendly, real.' },
    { icon: '💯', text: 'Real Talk', description: 'No filter, just truth.' },
    { icon: '🔥', text: 'Fuck It', description: 'Daren Unleashed.' },
    { icon: '🧠', text: 'Deep Dive', description: 'Explore the depths.' },
    { icon: '🧭', text: 'Mentor Mode', description: 'Strategic Advice.' },
    { icon: '😈', text: 'Frisky', description: 'Playful, flirty vibes.' },
];

export const ModeTiles: React.FC<ModeTilesProps> = ({ onSelectMode, currentMode, selectedModeForAnimation }) => {
    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            {modes.map((mode, index) => {
                const isCurrentlySelected = mode.text === currentMode;
                const isBeingClickedForTransition = mode.text === selectedModeForAnimation;

                const shouldGlow = isBeingClickedForTransition || (isCurrentlySelected && !selectedModeForAnimation);

                return (
                    <button
                        key={mode.text}
                        onClick={() => onSelectMode(mode.text)}
                        className={`mode-tile-button btn-radiate-glow group relative bg-[var(--card-bg)] p-3 rounded-2xl text-left focus:outline-none border border-white/5 
                        ${shouldGlow ? 'chase-border-glow' : ''}
                        tile-shine-effect
                        `}
                        style={{ animationDelay: `${index * 0.15}s` } as React.CSSProperties}
                    >
                        <span className="absolute -bottom-4 -right-3 text-8xl opacity-15 pointer-events-none select-none transform rotate-[-15deg]" aria-hidden="true">
                            {mode.icon}
                        </span>
                        <div className="flex items-start gap-2 relative z-10">
                            <p className="text-3xl origin-center group-hover:animate-wiggle-on-hover">{mode.icon}</p>
                            <div className="flex-1">
                                <p className="font-semibold text-white text-lg">{mode.text}</p>
                                <p className="text-sm text-[var(--text-secondary)] leading-tight">{mode.description}</p>
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    );
};