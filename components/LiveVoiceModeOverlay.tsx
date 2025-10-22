import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { NexusOrb } from './NexusOrb';
import { MicIcon } from './MicIcon';
import type { Message } from '../types';
import { Sender } from '../types';
import { decode, decodeAudioData } from '../services/geminiService';

// Base64 encoding function for audio data
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface LiveVoiceModeOverlayProps {
    onClose: () => void;
    onAddLiveMessages: (messages: Message[]) => void;
    systemInstruction: string;
}

type Status = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

export const LiveVoiceModeOverlay: React.FC<LiveVoiceModeOverlayProps> = ({ onClose, onAddLiveMessages, systemInstruction }) => {
    const [status, setStatus] = useState<Status>('connecting');
    const [isMuted, setIsMuted] = useState(false);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState('');

    const sessionRef = useRef<LiveSession | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    
    const outputSources = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTime = useRef(0);
    
    const userInputTranscript = useRef('');
    const aiOutputTranscript = useRef('');

    const thinkingTimerRef = useRef<number | null>(null);
    const statusResetTimerRef = useRef<number | null>(null);

    const cleanup = useCallback(() => {
        if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
        if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
        
        sessionRef.current?.close();
        sessionRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;
        
        if (inputAudioContextRef.current?.state !== 'closed') {
          inputAudioContextRef.current?.close();
          inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
          outputAudioContextRef.current?.close();
          outputAudioContextRef.current = null;
        }

        outputSources.current.forEach(source => source.stop());
        outputSources.current.clear();
    }, []);

    const connectAndListen = useCallback(async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputAudioContext;
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    systemInstruction: systemInstruction,
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
                },
                callbacks: {
                    onopen: () => {
                        if (!mediaStreamRef.current || !inputAudioContextRef.current) return;
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            if (isMuted) return;

                            setStatus('listening');
                            if (thinkingTimerRef.current) {
                                clearTimeout(thinkingTimerRef.current);
                                thinkingTimerRef.current = null;
                            }
                            thinkingTimerRef.current = window.setTimeout(() => {
                                setStatus('thinking');
                            }, 750);

                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (!outputAudioContextRef.current) return;
                        
                        if (message.serverContent?.inputTranscription) {
                            userInputTranscript.current += message.serverContent.inputTranscription.text;
                            setCurrentInterimTranscript(userInputTranscript.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            aiOutputTranscript.current += message.serverContent.outputTranscription.text;
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            if (thinkingTimerRef.current) {
                                clearTimeout(thinkingTimerRef.current);
                                thinkingTimerRef.current = null;
                            }
                            setStatus('speaking');
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            
                            const currentTime = outputAudioContextRef.current.currentTime;
                            const startTime = Math.max(currentTime, nextStartTime.current);
                            source.start(startTime);

                            nextStartTime.current = startTime + audioBuffer.duration;
                            outputSources.current.add(source);
                            source.onended = () => outputSources.current.delete(source);
                        }

                        if (message.serverContent?.turnComplete) {
                            const userMsg: Message = { id: Date.now().toString(), text: userInputTranscript.current.trim(), sender: Sender.User, timestamp: new Date().toISOString() };
                            const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiOutputTranscript.current.trim(), sender: Sender.AI, timestamp: new Date().toISOString() };
                           
                            if (userMsg.text || aiMsg.text) {
                                onAddLiveMessages([userMsg, aiMsg].filter(m => m.text));
                            }

                            userInputTranscript.current = '';
                            aiOutputTranscript.current = '';
                            setCurrentInterimTranscript('');
                            
                            if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
                            const remainingTime = (nextStartTime.current - outputAudioContextRef.current.currentTime) * 1000;
                            if (remainingTime > 100) {
                                statusResetTimerRef.current = window.setTimeout(() => setStatus('listening'), remainingTime);
                            } else {
                                setStatus('listening');
                            }
                        }
                        
                        if (message.serverContent?.interrupted) {
                             outputSources.current.forEach(source => source.stop());
                             outputSources.current.clear();
                             nextStartTime.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('error');
                    },
                    onclose: () => {
                        console.log('Live session closed.');
                    },
                }
            });

            sessionRef.current = await sessionPromise;

        } catch (err) {
            console.error("Error setting up live voice mode:", err);
            setStatus('error');
            alert("Could not start live voice mode. Please check microphone permissions.");
            onClose();
        }
    }, [systemInstruction, isMuted, onAddLiveMessages, onClose]);

    useEffect(() => {
        connectAndListen();
        return () => cleanup();
    }, [connectAndListen, cleanup]);

    const getStatusText = () => {
        switch (status) {
            case 'connecting': return 'Connecting to the ether...';
            case 'listening': return 'Listening...';
            case 'thinking': return 'Thinking...';
            case 'speaking': return 'Speaking...';
            case 'error': return 'Connection lost.';
            default: return '';
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-between p-8 animate-fade-in">
            {/* Header with Exit Button */}
            <div className="w-full flex justify-end">
                <button onClick={onClose} className="p-2 text-white/70 hover:text-white" aria-label="Exit Live Mode">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center text-center">
                <div className="w-48 h-48 mb-8">
                    <NexusOrb mood={status === 'listening' || status === 'speaking' ? 'listening' : 'thinking'} />
                </div>
                <p className="text-2xl text-white font-medium min-h-[3rem]">{getStatusText()}</p>
                <p className="text-xl text-white/60 font-light mt-2 min-h-[5rem] max-w-2xl">{currentInterimTranscript}</p>
            </div>

            {/* Footer with Mute Button */}
            <div className="flex items-center justify-center">
                <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500' : 'bg-white/10'}`} aria-label={isMuted ? "Unmute" : "Mute"}>
                    <MicIcon isListening={!isMuted} />
                </button>
            </div>
        </div>
    );
};
