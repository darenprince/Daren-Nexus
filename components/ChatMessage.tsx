import React, { useState } from 'react';
import { Message, Sender } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PlayPauseButton } from './PlayPauseButton';

interface ChatMessageProps {
  message: Message;
  textZoom: number;
}

const TRUNCATION_LIMIT = 280; // Character limit for initial display

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, textZoom }) => {
  const isAI = message.sender === Sender.AI;
  const fontSizeRem = textZoom / 100;
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { playbackState, play } = useAudioPlayer();
  const isPlaying = playbackState.playingId === message.id;
  const progress = isPlaying ? playbackState.progress : 0;

  const handleTogglePlay = () => {
    if (message.audioBuffer) {
      play(message.id, message.audioBuffer);
    }
  };

  const isLongAiMessage = isAI && message.text.length > TRUNCATION_LIMIT;
  
  const displayText = isLongAiMessage && !isExpanded
    ? message.text.substring(0, TRUNCATION_LIMIT) + '...'
    : message.text;

  const displayHtml = displayText.replace(/\n/g, '<br />');

  return (
    <div className={`flex items-end ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`relative max-w-sm md:max-w-md lg:max-w-lg`}>
        <div 
          className={`
            px-4 py-3 rounded-2xl shadow-md text-white/90 leading-relaxed border border-white/10
            ${isAI 
              ? 'bg-black/30 rounded-bl-lg'
              : 'bg-[var(--user-bubble-bg)]/30 rounded-br-lg'
            }
          `}
        >
          <div 
            className="prose prose-invert prose-base break-words" 
            style={{ fontSize: `${fontSizeRem}rem` }}
            dangerouslySetInnerHTML={{ __html: displayHtml }} 
          />

          {isLongAiMessage && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-nexusPurple-400 font-semibold mt-2 hover:underline focus:outline-none"
            >
              Read More...
            </button>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((att, index) => (
                      <img 
                          key={index} 
                          src={`data:${att.mimeType};base64,${att.base64}`} 
                          alt={`attachment ${index + 1}`}
                          className="max-w-full h-auto rounded-lg"
                      />
                  ))}
              </div>
          )}

           {message.audioBuffer && (
                <PlayPauseButton
                  onClick={handleTogglePlay}
                  isPlaying={isPlaying}
                  progress={progress}
                />
            )}
        </div>
      </div>
    </div>
  );
};