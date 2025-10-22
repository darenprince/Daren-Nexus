import React from 'react';
import { SpeakerWaveIcon } from './SpeakerWaveIcon';

interface PlayPauseButtonProps {
  onClick: () => void;
  isPlaying: boolean;
  progress: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 18; // 2 * PI * r

export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ onClick, isPlaying, progress }) => {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <button onClick={onClick} className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all group" aria-label={isPlaying ? "Stop audio" : "Play audio"}>
        <svg className="w-full h-full" viewBox="0 0 40 40">
            {/* Progress Circle Background */}
            <circle
                className="text-white/10"
                strokeWidth="2"
                stroke="currentColor"
                fill="transparent"
                r="18"
                cx="20"
                cy="20"
            />
            {/* Progress Circle Foreground */}
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
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white">
            {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="6" y="6" width="8" height="8" />
                </svg>
            ) : (
                <div className="w-5 h-5">
                    <SpeakerWaveIcon />
                </div>
            )}
        </div>
    </button>
  );
};