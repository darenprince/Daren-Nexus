/*
================================================================================
IMPORTANT NOTE FOR PRODUCTION DEPLOYMENT
================================================================================
The Gemini Live API (`ai.live.connect`) is a web-only feature that establishes a
direct WebSocket connection from the client to Google's servers. The Node.js
`@google/genai` SDK does not support this Live API.

This component now securely fetches the API key from the `/api/key` backend
endpoint. This prevents the key from being exposed in the bundled client-side
code, making the feature more secure and stable. The backend server is
responsible for managing the API key.
================================================================================
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { MicMuteIcon } from './MicMuteIcon';
import { PhoneHangUpIcon } from './PhoneHangUpIcon';
import type { Message } from '../types';
import { Sender } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { VoiceVisualizer } from './VoiceVisualizer';
import { ListeningLoader } from './ListeningLoader';
import { CloseIcon } from './CloseIcon';
import { getApiKey } from '../services/geminiService';

interface LiveVoiceModeOverlayProps {
    onClose: () => void;
    onAddLiveMessages: (messages: Message[]) => void;
    systemInstruction: string;
}

type Status = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';
type TranscriptionEntry = { sender: 'user' | 'ai'; text: string };

const BurnInAnimation: React.FC = () => (
    <div className="burn-in-animation">
        <div className="content">
            <div className="burn">
                <div className="flame"></div> <div className="flame"></div>
                <div className="flame"></div> <div className="flame"></div>
                <div className="flame"></div> <div className="flame"></div>
                <div className="flame"></div> <div className="flame"></div>
                <div className="flame"></div> <div className="flame"></div>
            </div>
        </div>
    </div>
);

export const LiveVoiceModeOverlay: React.FC<LiveVoiceModeOverlayProps> = ({ onClose, onAddLiveMessages, systemInstruction }) => {
    const [status, setStatus] = useState<Status>('connecting');
    const [isMuted, setIsMuted] = useState(false);
    const [showBurnIn, setShowBurnIn] = useState(true);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const sessionRef = useRef<{ close: () => void; sendRealtimeInput: (input: { media: Blob }) => void } | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const isMutedRef = useRef(isMuted);
    const endCallButtonRef = useRef<HTMLButtonElement>(null);

    
    const outputSources = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTime = useRef(0);
    
    const userInputTranscript = useRef('');
    const aiOutputTranscript = useRef('');
    const thinkingTimerRef = useRef<number | null>(null);

    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const handleToggleMute = () => {
        setIsMuted(prev => !prev);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBurnIn(false);
            endCallButtonRef.current?.focus(); // Focus after burn-in for accessibility
        }, 4000);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        // Use 'auto' scroll behavior to prevent jarring smooth scroll on every interim update.
        transcriptEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [transcriptionHistory, currentInterimTranscript]);

    const cleanup = useCallback(() => {
        if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
        
        // Save any final, unturned transcription fragments before closing.
        const userText = userInputTranscript.current.trim();
        const aiText = aiOutputTranscript.current.trim();
        const finalMessages: Message[] = [];
        if (userText) {
            finalMessages.push({ id: '', text: userText, sender: Sender.User, timestamp: new Date().toISOString() });
        }
        if (aiText) {
            finalMessages.push({ id: '', text: aiText, sender: Sender.AI, timestamp: new Date().toISOString() });
        }
        if (finalMessages.length > 0) {
            onAddLiveMessages(finalMessages);
        }
        userInputTranscript.current = '';
        aiOutputTranscript.current = '';

        // Clean up resources
        sessionRef.current?.close();
        sessionRef.current = null;
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close();
        if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close();
        outputSources.current.forEach(source => source.stop());
        outputSources.current.clear();
    }, [onAddLiveMessages]);
    
    const handleEndSession = useCallback(() => {
        cleanup();
        onClose();
    }, [cleanup, onClose]);

    useEffect(() => {
        const connectAndListen = async () => {
            try {
                const apiKey = await getApiKey();
                if (!apiKey) {
                    throw new Error("API_KEY is not configured on the server. Live voice mode cannot be started.");
                }
                
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
                mediaStreamRef.current = stream;

                const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                inputAudioContextRef.current = inputCtx;
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                const ai = new GoogleGenAI({ apiKey });

                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    config: {
                        systemInstruction,
                        responseModalities: [Modality.AUDIO],
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
                    },
                    callbacks: {
                        onopen: () => {
                            if (!mediaStreamRef.current || !inputCtx) return;
                            
                            const source = inputCtx.createMediaStreamSource(mediaStreamRef.current);
                            mediaStreamSourceRef.current = source;
                            
                            const analyser = inputCtx.createAnalyser();
                            setAnalyserNode(analyser);

                            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current = scriptProcessor;
                            
                            source.connect(analyser);
                            analyser.connect(scriptProcessor);
                            scriptProcessor.connect(inputCtx.destination);

                            scriptProcessor.onaudioprocess = (e) => {
                                if (status !== 'speaking') setStatus('listening');
                                
                                if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
                                thinkingTimerRef.current = window.setTimeout(() => setStatus('thinking'), 1200);

                                if (isMutedRef.current) return; 

                                const inputData = e.inputBuffer.getChannelData(0);
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(v => v * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                            };
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);

                            if (message.serverContent?.inputTranscription) {
                                userInputTranscript.current += message.serverContent.inputTranscription.text;
                                setCurrentInterimTranscript(userInputTranscript.current);
                            }
                            if (message.serverContent?.outputTranscription) {
                                aiOutputTranscript.current += message.serverContent.outputTranscription.text;
                            }

                            const audioPart = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData);
                            if (audioPart?.inlineData?.data && outputAudioContextRef.current) {
                                setStatus('speaking');
                                const audioBuffer = await decodeAudioData(decode(audioPart.inlineData.data), outputAudioContextRef.current, 24000, 1);
                                const source = outputAudioContextRef.current.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputAudioContextRef.current.destination);
                                
                                const startTime = Math.max(outputAudioContextRef.current.currentTime, nextStartTime.current);
                                source.start(startTime);
                                nextStartTime.current = startTime + audioBuffer.duration;
                                outputSources.current.add(source);
                                source.onended = () => {
                                    outputSources.current.delete(source);
                                    if(outputSources.current.size === 0) setStatus('listening');
                                };
                            }

                            if (message.serverContent?.turnComplete) {
                                const userText = userInputTranscript.current.trim();
                                const aiText = aiOutputTranscript.current.trim();
                                
                                const newMessagesForChat: Message[] = [];
                                const newEntries: TranscriptionEntry[] = [];
                                
                                if (userText) {
                                    newEntries.push({ sender: 'user', text: userText });
                                    newMessagesForChat.push({ id: '', text: userText, sender: Sender.User, timestamp: new Date().toISOString() });
                                }
                                if (aiText) {
                                    newEntries.push({ sender: 'ai', text: aiText });
                                     newMessagesForChat.push({ id: '', text: aiText, sender: Sender.AI, timestamp: new Date().toISOString() });
                                }
                                if (newEntries.length > 0) {
                                    setTranscriptionHistory(prev => [...prev, ...newEntries]);
                                }
                                if (newMessagesForChat.length > 0) {
                                    onAddLiveMessages(newMessagesForChat);
                                }
                                
                                userInputTranscript.current = '';
                                aiOutputTranscript.current = '';
                                setCurrentInterimTranscript('');
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Live session error:', e.message);
                            setErrorMessage('A network error occurred. The connection was lost.');
                            setStatus('error');
                        },
                        onclose: () => console.log('Live session closed.'),
                    }
                });
                sessionRef.current = await sessionPromise;
            } catch (err: any) {
                console.error("Error setting up live voice mode:", err);
                setErrorMessage(err.message || "Could not start live voice mode. Please check microphone permissions.");
                setStatus('error');
            }
        };

        connectAndListen();
        return () => cleanup();
    }, [systemInstruction, cleanup, onAddLiveMessages]);

    const getStatusText = () => {
        if (isMuted) return 'Muted';
        switch (status) {
            case 'connecting': return 'hmm....';
            case 'listening': return 'Listening...';
            case 'thinking': return 'Thinking...';
            case 'speaking': return 'Speaking...';
            case 'error': return errorMessage || 'Connection lost.';
            default: return '';
        }
    };

    const MainUI = () => (
        <>
            <div className="live-voice-header">
                <button onClick={handleEndSession} className="p-2 text-white/70 hover:text-white btn-radiate-glow" aria-label="Exit Live Mode">
                    <CloseIcon />
                </button>
            </div>

            {/* Transcript Area */}
            <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-end min-h-0 pt-16 pb-4 px-4 text-center">
                 <div className="live-voice-transcript w-full no-scrollbar smooth-scroll fade-scroll-edges">
                     {transcriptionHistory.map((entry, i) => (
                        <p key={i} className={`text-2xl leading-relaxed ${entry.sender === 'user' ? 'text-white/90' : 'bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-semibold'}`}>
                           {entry.text}
                        </p>
                     ))}
                     {currentInterimTranscript && <p className="text-2xl leading-relaxed text-white/60">{currentInterimTranscript}</p>}
                     <div ref={transcriptEndRef} />
                 </div>
            </div>

            {/* Middle Area: Loader & Status */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-full pointer-events-none">
                <div className="relative w-64 h-64 flex-shrink-0">
                    {status === 'listening' && !isMuted && <ListeningLoader />}
                </div>
                 <p id="live-voice-status" className={`text-xl font-medium min-h-[2rem] -mt-8 ${status === 'error' ? 'text-red-400' : 'text-white'}`} aria-live="assertive">{getStatusText()}</p>
            </div>

            {/* Bottom Visualizer */}
            <div className="absolute bottom-12 left-0 right-0 h-48 pointer-events-none">
                <VoiceVisualizer isListening={!isMuted} analyserNode={analyserNode} />
            </div>

            {/* Bottom Controls */}
            <div className="live-voice-footer left-1/2 -translate-x-1/2">
                <button onClick={handleToggleMute} className={`mute-btn p-5 rounded-full transition-colors btn-radiate-glow ${isMuted ? 'muted' : ''}`} aria-label={isMuted ? "Unmute" : "Mute"}>
                    <div className="text-white">
                        <MicMuteIcon />
                    </div>
                </button>
                <button ref={endCallButtonRef} onClick={handleEndSession} className="end-call-btn p-5 rounded-full btn-radiate-glow" aria-label="End Call">
                    <PhoneHangUpIcon />
                </button>
            </div>
        </>
    );
    
    return (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-60 flex flex-col items-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="live-voice-status"
        >
            {showBurnIn ? (
                <div className="flex flex-col items-center justify-center h-full" role="status">
                    <div className="w-[350px] h-[350px]"><BurnInAnimation /></div>
                    <div className="themed-dot-loader flex space-x-2 mt-8">
                        <div className="h-3 w-3 animate-dot-bounce rounded-full dot-1"></div>
                        <div className="h-3 w-3 animate-dot-bounce rounded-full dot-2"></div>
                        <div className="h-3 w-3 animate-dot-bounce rounded-full dot-3"></div>
                    </div>
                </div>
            ) : <MainUI />}
        </div>
    );
};