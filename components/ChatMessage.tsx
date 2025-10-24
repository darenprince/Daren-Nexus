import React, { useState, useEffect } from 'react';
import { Message, Sender } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PlayPauseButton } from './PlayPauseButton';

interface ChatMessageProps {
  message: Message;
  textZoom: number;
  ttsLoadingMessageId: string | null;
}

const TRUNCATION_LIMIT = 280; // Character limit for initial display

/**
 * Renders a single chat message bubble for either the user or the AI.
 * It handles message truncation, attachment display, and audio playback controls.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message, textZoom, ttsLoadingMessageId }) => {
  // State to track if the component has just mounted to trigger an animation.
  const [isNewlyMounted, setIsNewlyMounted] = useState(true);
  // State to manage the expansion of long AI messages.
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isAI = message.sender === Sender.AI;
  const fontSizeRem = textZoom / 100;

  useEffect(() => {
    // The chase animation is 4s long. We'll keep the `isNewlyMounted` state true
    // for that duration to let one full cycle of the animation play.
    const timer = setTimeout(() => {
      setIsNewlyMounted(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []); // This effect runs only once on component mount.
  
  // Audio player context for managing playback state globally.
  const { playbackState, play } = useAudioPlayer();
  const isPlaying = playbackState.playingId === message.id;
  const progress = isPlaying ? playbackState.progress : 0;

  // Determines if the audio for this specific message is currently being generated.
  const isAudioLoading = isAI && !message.audioBuffer && ttsLoadingMessageId === message.id;
  // Determines if the audio is either loading or currently playing.
  const isAudioActive = isAI && (isAudioLoading || isPlaying);
  
  const chaseClass = isAI ? 'ai-bubble-chase-glow' : 'user-bubble-chase-glow';
  // The animation is shown when the bubble first appears, or if audio is loading/playing.
  const showChaseAnimation = isNewlyMounted || isAudioActive;

  const handleTogglePlay = () => {
    if (message.audioBuffer) {
      play(message.id, message.audioBuffer);
    }
  };

  const isLongAiMessage = isAI && message.text.length > TRUNCATION_LIMIT;
  
  const displayText = isLongAiMessage && !isExpanded
    ? message.text.substring(0, TRUNCATION_LIMIT) + '...'
    : message.text;

  // Replace newline characters with <br> for proper HTML rendering.
  const displayHtml = displayText.replace(/\n/g, '<br />');

  return (
    <div className={`flex items-end ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`relative max-w-sm md:max-w-md lg:max-w-lg`}>
        <div 
          className={`
            relative
            px-4 py-3 rounded-2xl shadow-md text-white/90 leading-relaxed border border-white/10
            ${isAI 
              ? 'bg-black/30 rounded-bl-lg'
              : 'bg-[var(--user-bubble-bg)]/30 rounded-br-lg'
            }
            ${showChaseAnimation ? chaseClass : ''}
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
              className="text-nexusPurple-500/90 font-semibold mt-2 hover:underline focus:outline-none"
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

           {(isAI && (message.audioBuffer || isAudioLoading)) && (
                <PlayPauseButton
                  onClick={handleTogglePlay}
                  isPlaying={isPlaying}
                  progress={progress}
                  isLoading={isAudioLoading}
                />
            )}
        </div>
      </div>
    </div>
  );
};