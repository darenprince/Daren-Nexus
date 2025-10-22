import React from 'react';

interface MicIconProps {
  isListening: boolean;
}

export const MicIcon: React.FC<MicIconProps> = ({ isListening }) => {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      {isListening && (
        <div className="absolute inset-[-4px] bg-red-500/50 rounded-full animate-pulse"></div>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 relative"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isListening ? "#EF4444" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="scale(0.9) translate(1.3, 1.3)">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </g>
      </svg>
    </div>
  );
};