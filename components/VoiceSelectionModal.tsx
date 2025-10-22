import React from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PreviewPlayButton } from './PreviewPlayButton';

interface VoiceSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTtsVoice: string;
    onSelectTtsVoice: (voice: string) => void;
    onPreviewTtsVoice: (voice: string, text: string) => Promise<AudioBuffer | undefined>;
    isVoicePreviewLoading: string | null;
}

const ttsVoices = [
    { id: 'Charon', name: 'The Strategist', previewText: "Let's cut through the bullshit and find the signal in the noise." },
    { id: 'Fenrir', name: 'The Brawler', previewText: "You wanna talk real? Let's fucking go." },
    { id: 'Zephyr', name: 'Laid Back', previewText: "Alright, let's just vibe for a minute. What's good?" },
    { id: 'rasalgethi', name: 'The Philosopher', previewText: "What's the pattern that connects all of this?" },
    { id: 'Puck', name: 'Nexus Standard', previewText: "This is the Nexus. No filter, no bullshit." },
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
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-xl text-white">Voice Selection</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close voice selection"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <ul className="space-y-1">
                        {ttsVoices.map(voice => {
                            const previewId = `preview-${voice.id}`;
                            const isThisLoading = isVoicePreviewLoading === voice.id;
                            const isThisPlaying = playbackState.playingId === previewId;
                            const progress = isThisPlaying ? playbackState.progress : 0;
                            return (
                                <li key={voice.id}>
                                    <div 
                                        onClick={() => onSelectTtsVoice(voice.id)}
                                        className={`w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--card-hover-bg)] transition-colors duration-200 text-left ${currentTtsVoice === voice.id ? 'bg-white/10' : ''}`}
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