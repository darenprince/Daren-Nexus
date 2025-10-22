import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { audioService } from '../services/audioService';

interface PlaybackState {
  playingId: string | null;
  progress: number;
}

interface AudioPlayerContextType {
  playbackState: PlaybackState;
  play: (id: string, buffer: AudioBuffer) => void;
  stop: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    playingId: null,
    progress: 0,
  });

  const stop = useCallback(() => {
    audioService.stop();
    setPlaybackState({ playingId: null, progress: 0 });
  }, []);

  const play = useCallback((id: string, buffer: AudioBuffer) => {
    // If we're asked to play the same thing, it should stop.
    if (playbackState.playingId === id) {
      stop();
      return;
    }

    const onProgress = (progress: number) => {
      setPlaybackState(currentState => 
        currentState.playingId === id ? { ...currentState, progress } : currentState
      );
    };

    const onEnd = () => {
      setPlaybackState(currentState => 
        currentState.playingId === id ? { playingId: null, progress: 0 } : currentState
      );
    };

    audioService.play(buffer, onProgress, onEnd);
    // Set initial state immediately for better UI response
    setPlaybackState({ playingId: id, progress: 0 });
  }, [playbackState.playingId, stop]);

  return (
    <AudioPlayerContext.Provider value={{ playbackState, play, stop }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
