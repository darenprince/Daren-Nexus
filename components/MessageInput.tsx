import React, { useRef, useEffect, useState } from 'react';
import { PaperclipIcon } from './PaperclipIcon';
import { WaveformIcon } from './WaveformIcon';
import { MicIcon } from './MicIcon';
import { SendIcon } from './SendIcon';
import { ChevronRightIcon } from './ChevronRightIcon';

interface MessageInputProps {
  input: string;
  setInput: (input: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  onToggleLiveVoiceMode: () => void;
  attachments: { file: File; base64: string }[];
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  setIsInputFocused: (isFocused: boolean) => void;
}

/**
 * A component for the main message input bar, including text area, send button,
 * and a tray of action buttons (attach, live voice, voice input).
 * Features an auto-expanding text area and a collapsible action tray for a clean UI.
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  onSendMessage,
  isLoading,
  isListening,
  onToggleListening,
  onToggleLiveVoiceMode,
  attachments,
  onFileSelect,
  onRemoveAttachment,
  setIsInputFocused,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocusedInternal] = useState(false);
  const [isTrayExpandedManual, setIsTrayExpandedManual] = useState(false);

  const isSendDisabled = isLoading || (!input.trim() && attachments.length === 0);
  // The tray should initially appear collapsed when the input is focused.
  const showCollapsedTray = isFocused && !isTrayExpandedManual;

  const handleFocus = () => {
    setIsFocusedInternal(true);
    setIsInputFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocusedInternal(false);
    setIsInputFocused(false);
    // Reset the manual expansion when the input is blurred.
    setIsTrayExpandedManual(false);
  };

  /**
   * Effect to auto-resize the textarea based on its content, up to a maximum height.
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = scrollHeight;
      textareaRef.current.style.height = `${Math.min(newHeight, 200)}px`;
    }
  }, [input, isFocused]);

  const handleSend = () => {
    if (!isSendDisabled) {
      onSendMessage(input);
    }
  };

  /**
   * Handles the 'Enter' key press to send the message, unless 'Shift' is held.
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-shrink-0 bg-[var(--input-bg)] px-4 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-[var(--ui-border-color)] transition-colors duration-500">
      {/* Display previews for any attached images */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((att, index) => (
            <div key={index} className="relative">
              <img
                src={`data:${att.file.type};base64,${att.base64}`}
                alt={att.file.name}
                className="h-16 w-16 object-cover rounded-md"
              />
              <button
                onClick={() => onRemoveAttachment(index)}
                className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-0.5 text-white btn-radiate-glow"
                aria-label="Remove attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-stretch gap-2">
        {/* Collapsible Action Tray */}
        <div className={`relative flex items-center transition-all duration-300 ease-in-out ${showCollapsedTray ? 'w-10' : 'w-auto'}`}>
            {/* Collapsed Button: Only visible when input is focused but not manually expanded */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showCollapsedTray ? 'opacity-100 delay-200' : 'opacity-0 pointer-events-none'}`}>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Prevents blur on click
                    onClick={() => setIsTrayExpandedManual(true)}
                    className="p-2 text-gray-400 hover:text-white btn-radiate-glow"
                    aria-label="Expand message options"
                >
                    <ChevronRightIcon />
                </button>
            </div>

            {/* Expanded Icons: Visible by default or when manually expanded */}
            <div className={`flex items-center transition-all duration-300 ${showCollapsedTray ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                <button
                  type="button"
                  onClick={handleAttachmentClick}
                  className="p-2 text-gray-400 hover:text-white transition-colors btn-radiate-glow"
                  aria-label="Attach file"
                >
                  <PaperclipIcon />
                </button>
                <button
                  type="button"
                  onClick={onToggleLiveVoiceMode}
                  className="p-2 text-gray-400 hover:text-white transition-colors btn-radiate-glow"
                  aria-label="Live voice mode"
                >
                  <WaveformIcon />
                </button>
                <button
                    type="button"
                    onClick={onToggleListening}
                    className="p-2 text-gray-400 hover:text-white transition-colors btn-radiate-glow"
                    aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                  <MicIcon isListening={isListening} />
                </button>
            </div>
        </div>
        
        <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
        
        <div className="flex-1 relative flex items-center">
          <div className={`relative w-full rounded-2xl ${isFocused ? 'input-chase-glow' : ''}`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Message..."
              aria-label="Chat message input"
              disabled={isLoading || isListening}
              className="relative z-10 w-full bg-[var(--input-bg)] text-white placeholder:text-gray-500 border border-white/10 focus:border-transparent rounded-2xl px-4 py-3 resize-none transition-colors duration-200 no-scrollbar leading-tight"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSendDisabled}
          className={`btn-radiate-glow p-2 flex items-center justify-center transition-opacity ${isSendDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          aria-label="Send message"
        >
          <SendIcon disabled={isSendDisabled} />
        </button>
      </form>
    </div>
  );
};