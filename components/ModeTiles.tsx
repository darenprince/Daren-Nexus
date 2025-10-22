import React from 'react';

interface ModeTilesProps {
    onSelectMode: (mode: string) => void;
}

const modes = [
    { icon: '💯', text: 'Real Talk', description: 'No filter, just truth.' },
    { icon: '🔥', text: 'Fuck-It', description: 'Unleash the raw energy.' },
    { icon: '🧠', text: 'Deep Dive', description: 'Explore complex ideas.' },
    { icon: '😈', text: 'Frisky', description: 'Playful, flirty vibes.' },
];

export const ModeTiles: React.FC<ModeTilesProps> = ({ onSelectMode }) => {
    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            {modes.map((mode, index) => (
                <button
                    key={mode.text}
                    onClick={() => onSelectMode(mode.text)}
                    className="group relative overflow-hidden bg-[var(--card-bg)] p-4 rounded-2xl hover:bg-[var(--card-hover-bg)] transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-[var(--purple-glow)] border border-white/5 chase-border-glow"
                    style={{ animationDelay: `${index * 0.5}s` } as React.CSSProperties}
                >
                    <span className="absolute -bottom-4 -right-3 text-8xl opacity-15 pointer-events-none select-none transform rotate-[-15deg]" aria-hidden="true">
                        {mode.icon}
                    </span>
                    <p className="text-4xl origin-bottom-left group-hover:animate-wiggle-on-hover">{mode.icon}</p>
                    <p className="font-semibold text-white mt-2 text-xl">{mode.text}</p>
                    <p className="text-base text-[var(--text-secondary)]">{mode.description}</p>
                </button>
            ))}
        </div>
    );
};