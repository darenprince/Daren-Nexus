// FIX: Add type definitions for Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { NexusOrb } from './NexusOrb';
import { VoiceVisualizer } from './VoiceVisualizer';
import { CloseIcon } from './CloseIcon';

interface VoiceInputOverlayProps {
  onClose: () => void;
  onSend: (message: string) => void;
}

export const VoiceInputOverlay: React.FC<VoiceInputOverlayProps> = ({ onClose, onSend }) => {
  const [transcript, setTranscript] = useState('');
  const [orbScale, setOrbScale] = useState(1);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const stopButtonRef = useRef<HTMLButtonElement>(null);


  const handleStop = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    stopButtonRef.current?.focus();
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // FIX: Correctly build the full transcript from all results.
    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };
    
    // FIX: Gracefully handle non-critical errors like 'aborted'.
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // The 'aborted' and 'no-speech' errors are not critical.
      // They can happen if the user is silent. We'll let the 'onend'
      // event handler gracefully close the session.
      if (event.error === 'aborted' || event.error === 'no-speech') {
        console.warn(`Speech recognition ended: ${event.error}`);
      } else {
        console.error('Speech recognition error:', event.error);
      }
    };

    // FIX: Use onend as the single point of cleanup and sending the transcript.
    recognition.onend = () => {
      // This is the single point for cleaning up and finalizing the speech input.
      // It's triggered by calling .stop(), by an error, or by the service timing out.
      setTranscript(currentTranscript => {
        if (currentTranscript.trim()) {
            onSend(currentTranscript.trim());
        }
        onClose();
        return ''; // Reset for next time
      });
    };
    
    recognitionRef.current = recognition;

    const setupAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const analyser = audioContext.createAnalyser();
            analyser.smoothingTimeConstant = 0.3;
            analyser.fftSize = 2048; // Higher resolution for waveform
            analyserRef.current = analyser;
            setAnalyserNode(analyser);
            
            source.connect(analyser);

            recognition.start();

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const animate = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
                    const scale = 1 + (avg / 128) * 0.5; // Scale between 1 and 1.5
                    setOrbScale(scale);
                }
                animationFrameId.current = requestAnimationFrame(animate);
            };
            animate();

        } catch (err: any) {
            console.error("Error accessing microphone:", err);
            let alertMessage = "Could not access the microphone. Please check your browser permissions.";

            if (err instanceof DOMException) {
                switch (err.name) {
                    case 'NotAllowedError':
                    case 'PermissionDeniedError': // Deprecated but good to check
                        alertMessage = "Microphone access was denied by you or your system. To use voice input, please allow microphone access in your browser's site settings and reload the page.";
                        break;
                    case 'NotFoundError':
                        alertMessage = "No microphone was found. Please ensure a microphone is connected and enabled.";
                        break;
                    case 'NotReadableError':
                        alertMessage = "There was a hardware error, or your microphone is being used by another application. Please check your microphone and close any other apps using it.";
                        break;
                    default:
                        alertMessage = `An unexpected error occurred: ${err.message}. Please check your microphone and browser settings.`;
                }
            }
            
            alert(alertMessage);
            onClose();
        }
    };
    
    setupAudio();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (recognitionRef.current) {
        // Detach handlers to prevent them from being called after the component has unmounted
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [onClose, onSend]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-input-transcript"
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white" aria-label="Close voice input">
         <CloseIcon />
      </button>

      <div className="flex-1 flex items-center justify-center">
        <p id="voice-input-transcript" className="text-3xl text-white/80 font-medium text-center max-w-3xl min-h-[10rem]" aria-live="polite">
          {transcript || 'Listening...'}
        </p>
      </div>

      <VoiceVisualizer isListening={true} analyserNode={analyserNode} />

      <div className="flex flex-col items-center">
        <button ref={stopButtonRef} onClick={handleStop} className="w-24 h-24 rounded-full flex items-center justify-center" aria-label="Stop listening">
            <div 
                className="w-full h-full transition-transform duration-100 ease-out" 
                style={{ transform: `scale(${orbScale})` }}
            >
                <NexusOrb mood="listening" />
            </div>
        </button>
        <p className="text-white/60 mt-4 text-lg">Tap flame to finish</p>
      </div>
    </div>
  );
};