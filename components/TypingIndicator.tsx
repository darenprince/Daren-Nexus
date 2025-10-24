import React from 'react';
import { NexusOrb } from './NexusOrb';
import { StopIcon } from './StopIcon';

interface TypingIndicatorProps {
  onCancelGeneration: () => void;
  isExtraThinking: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ onCancelGeneration, isExtraThinking }) => {
  if (isExtraThinking) {
    return (
      <div className="flex items-center justify-start w-full animate-fade-in">
        <div className="flex items-center gap-4 rounded-2xl rounded-bl-lg bg-black/30 px-4 py-3 shadow-md">
            <span className="text-white/70 italic">Thinking deeply...</span>
            <button
              onClick={onCancelGeneration}
              aria-label="Stop generation"
              className="border-l border-white/20 pl-4 text-white/60 transition-colors hover:text-white"
            >
              <StopIcon />
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-8 h-8 flex-shrink-0 mb-1">
        <NexusOrb mood="thinking" />
      </div>
      <div className="flex items-center gap-4 rounded-2xl rounded-bl-lg bg-black/30 px-4 py-3 shadow-md">
        <div className="flex space-x-1.5">
          <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white/70" style={{ animationDelay: '0s' }}></div>
          <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white/70" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white/70" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <button
          onClick={onCancelGeneration}
          aria-label="Stop generation"
          className="border-l border-white/20 pl-4 text-white/60 transition-colors hover:text-white"
        >
          <StopIcon />
        </button>
      </div>
    </div>
  );
};