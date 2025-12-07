import React, { useRef, useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PreviewPlayButton } from './PreviewPlayButton';
import { CloseIcon } from './CloseIcon';

interface VoiceSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTtsVoice: string;
    onSelectTtsVoice: (voice: string) => void;
    onPreviewTtsVoice: (voice: string, text: string) => Promise<AudioBuffer | undefined>;
    isVoicePreviewLoading: string | null;
}

const ttsVoices = [
    { id: 'Orion', name: 'The Hunter', previewText: "Target acquired. Let's cut to the chase and eliminate the bullshit." },
    { id: 'Atlas', name: 'The Titan', previewText: "There's no weight in the world heavier than an unspoken truth. Let's lift it." },
    { id: 'Hyperion', name: 'The Watcher', previewText: "From a higher perspective, the patterns of nonsense become clear." },
    { id: 'Ares', name: 'The Warlord', previewText: "This isn't a conversation. It's a campaign against mediocrity. Let's fucking go." },
    { id: 'Fenrir', name: 'The Beast', previewText: "Unleash the primal truth. No chains, no mercy, just raw honesty." },
];

export const VoiceSelectionModal: React.FC<VoiceSelectionModalProps> = ({ 
    isOpen, 
    onClose,
    currentTtsVoice,
    onSelectTtsVoice,
    onPreviewTtsVoice,
    isVoicePreviewLoading
}) => {
    const { playbackState, play, stop } = useAudioPlayer();
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePreviewClick = async (voiceId: string, previewText: string) => {
        const previewId = `preview-${voiceId}`;
        const isThisPlaying = playbackState.playingId === previewId;

        if (isThisPlaying) {
            stop();
        } else {
            // Stop any other audio that might be playing
            if (playbackState.playingId) {
              stop();
            }
            try {
                const buffer = await onPreviewTtsVoice(voiceId, previewText);
                if (buffer) {
                    play(previewId, buffer);
                }
            } catch (error) {
                console.error("Error during voice preview:", error);
            }
        }
    };


    return (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-selection-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 id="voice-selection-title" className="font-heading text-xl text-white">Voice Selection</h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close voice selection"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <ul className="space-y-1" role="radiogroup" aria-labelledby="voice-selection-title">
                        {ttsVoices.map(voice => {
                            const previewId = `preview-${voice.id}`;
                            const isThisLoading = isVoicePreviewLoading === voice.id;
                            const isThisPlaying = playbackState.playingId === previewId;
                            const progress = isThisPlaying ? playbackState.progress : 0;
                            return (
                                <li key={voice.id}>
                                    <div 
                                        role="radio"
                                        aria-checked={currentTtsVoice === voice.id}
                                        onClick={() => onSelectTtsVoice(voice.id)}
                                        className={`w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--card-hover-bg)] transition-colors duration-200 text-left ${currentTtsVoice === voice.id ? 'bg-white/10' : ''}`}
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? onSelectTtsVoice(voice.id) : null}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium text-base ${currentTtsVoice === voice.id ? 'text-white' : 'text-gray-300'}`}>{voice.name}</span>
                                            {currentTtsVoice === voice.id && (
                                                <span className="text-xs font-semibold text-green-400">(selected)</span>
                                            )}
                                        </div>
                                        <PreviewPlayButton
                                            onClick={() => handlePreviewClick(voice.id, voice.previewText)}
                                            isLoading={isThisLoading}
                                            isPlaying={isThisPlaying}
                                            progress={progress}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};