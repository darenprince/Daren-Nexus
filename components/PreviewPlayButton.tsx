import React from 'react';

interface PreviewPlayButtonProps {
    onClick: () => void;
    isLoading: boolean;
    isPlaying: boolean;
    progress?: number;
}

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);
const StopIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
         <rect x="7" y="7" width="6" height="6" />
    </svg>
);

const CIRCUMFERENCE = 2 * Math.PI * 18; // 2 * PI * r

export const PreviewPlayButton: React.FC<PreviewPlayButtonProps> = ({ onClick, isLoading, isPlaying, progress = 0 }) => {
    const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="p-3 rounded-full hover:bg-white/20 disabled:opacity-50 relative w-11 h-11 flex items-center justify-center"
            aria-label={isPlaying ? 'Stop preview' : 'Preview voice'}
            disabled={isLoading}
        >
            {isLoading && <SpinnerIcon />}

            {!isLoading && (
                <>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
                        {/* Background Circle */}
                        <circle
                            className="text-white/10"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="transparent"
                            r="18"
                            cx="20"
                            cy="20"
                        />
                        {/* Progress Circle if playing */}
                        {isPlaying && (
                             <circle
                                className="text-nexusPurple-500 transition-all duration-150"
                                strokeWidth="2"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="18"
                                cx="20"
                                cy="20"
                                transform="rotate(-90 20 20)"
                            />
                        )}
                    </svg>
                    <div className="relative"> {/* To keep icon on top */}
                      {isPlaying ? <StopIcon /> : <PlayIcon />}
                    </div>
                </>
            )}
        </button>
    );
};