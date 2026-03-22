import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChatHistory } from './components/ChatHistory';
import { ChatWindow } from './components/ChatWindow';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { InitialLoading } from './components/InitialLoading';
import { Menu } from './components/Menu';
import { MessageInput } from './components/MessageInput';
import { AppearanceModal } from './components/AppearanceModal';
import { VoiceSelectionModal } from './components/VoiceSelectionModal';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { BugReportModal } from './components/BugReportModal';
import { VoiceInputOverlay } from './components/VoiceInputOverlay';
import { LiveVoiceModeOverlay } from './components/LiveVoiceModeOverlay';
import { NexusAndChillModal } from './components/NexusAndChillModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ProfileModal } from './components/ProfileModal';
import { MemoryVaultModal } from './components/MemoryVaultModal';

import { loginOrSignup, continueAsGuest, getCurrentUser, logout, saveCurrentUserName } from './services/authService';
import { archiveCurrentSession } from './services/chatHistoryService';
import { sendMessage } from './services/dialogflowService';
import { generateSpeech, classifyTextIntent } from './services/geminiService';
import { getAudioContext } from './services/audioService';
import {
  getCurrentSession,
  getLiveSystemInstruction,
  getTtsVoice,
  getTextZoom,
  getTheme,
  saveCurrentSession,
  saveTtsVoice,
  saveTextZoom,
  saveTheme,
  saveLiveSystemInstruction,
} from './services/persistenceService';
import { initialSystemInstruction } from './services/persona';


import type { Message, User, Attachment } from './types';
import { Sender } from './types';

import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { AgeGatingModal } from './components/AgeGatingModal';
import { FieryTransition } from './components/FieryTransition';

// Centralized definition for TTS voices used in the app.
const ttsVoices = [
    { id: 'Charon', name: 'Nexus (Default)', previewText: "Okay, let's break this down. First principles. What's the actual goal here?" },
    { id: 'Fenrir', name: 'Unfiltered', previewText: "Alright, let's cut the shit. What's the real problem we're solving right now?" },
    { id: 'Puck', name: 'Legacy', previewText: "This is the Nexus. No filter, no bullshit. Just the straight-up truth." },
    { id: 'Kore', name: 'Vibing', previewText: "Aight, cool. We can just chop it up. No agenda, just real talk. What's on your mind?" },
];

/**
 * The main application component. Manages all application state, including authentication,
 * UI visibility, chat messages, and user settings. It serves as the central hub for
 * all interactions and modal dialogs.
 */
const App: React.FC = () => {
    // --- State Declarations ---

    // Auth state: Manages the current user and authentication status.
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    // UI state: Controls the visibility of major UI components like the intro, home screen, and menus.
    const [showHomeScreen, setShowHomeScreen] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAgeGated, setIsAgeGated] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    
    // Home screen animation state for smooth transitions.
    const [selectedModeForAnimation, setSelectedModeForAnimation] = useState<string | null>(null);
    const [showFieryTransition, setShowFieryTransition] = useState(false);
    const appContainerRef = useRef<HTMLDivElement>(null);


    // Modal states: Toggles for all modal dialogs within the application.
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
    const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);
    const [isModeSelectionOpen, setIsModeSelectionOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
    const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
    const [isVoicePreviewLoading, setIsVoicePreviewLoading] = useState<string | null>(null);
    const [isNexusAndChillOpen, setIsNexusAndChillOpen] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState(false);


    // Chat state: Manages messages, user input, attachments, and loading indicators.
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<{ file: File; base64: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExtraThinking, setIsExtraThinking] = useState(false);
    const [ttsLoadingMessageId, setTtsLoadingMessageId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Settings state: Manages the AI's persona, model, voice, and visual settings.
    const [currentMode, setCurrentMode] = useState('Vibing');
    const [currentAiModel, setCurrentAiModel] = useState('gemini-2.5-flash');
    const [ttsVoice, setTtsVoice] = useState('Charon');
    const [textZoom, setTextZoom] = useState(100);
    const [theme, setTheme] = useState('theme-default');
    const [liveSystemInstruction, setLiveSystemInstruction] = useState(initialSystemInstruction);

    // Caching state: Holds pre-generated audio for voice previews.
    const voicePreviewCache = useRef(new Map<string, AudioBuffer>());
    
    // --- Effects ---
    
    const prevThemeRef = useRef(theme);

    /**
     * On initial load, check for an authenticated user.
     */
    useEffect(() => {
        try {
            const user = getCurrentUser();
            if (user) {
                setCurrentUser(user);
                setAuthStatus('authenticated');
            } else {
                setAuthStatus('unauthenticated');
            }
        } catch (error) {
            console.error("Auth initialization failed:", error);
            setAuthStatus('unauthenticated'); // Fallback to login screen
        }
    }, []);
    
    // Accessibility: Determine if any modal is open to hide background content.
    const isModalOpen = isMenuOpen || isHistoryOpen || isAppearanceOpen || isVoiceSelectionOpen || isModeSelectionOpen || isBugModalOpen || isVoiceInputOpen || isLiveVoiceOpen || isNexusAndChillOpen || isForgotPasswordOpen || isProfileModalOpen || isMemoryVaultOpen;

    /**
     * ACCESSIBILITY: Hides the main app content from screen readers and keyboard
     * navigation when a modal is open.
     */
    useEffect(() => {
        const appContainer = appContainerRef.current;

        if (appContainer) {
            if (isModalOpen || isAgeGated) {
                appContainer.setAttribute('aria-hidden', 'true');
                appContainer.setAttribute('inert', '');
            } else {
                appContainer.removeAttribute('aria-hidden');
                appContainer.removeAttribute('inert');
            }
        }
    }, [isModalOpen, isAgeGated]);


    /**
     * Manages global CSS classes on the `<body>` element based on theme and chat state.
     * This allows for global styling changes like background gradients and layout adjustments.
     */
    useEffect(() => {
        const bodyClassList = document.body.classList;
        
        // Theme Management: Remove previous theme, add current theme for global styling.
        bodyClassList.remove(prevThemeRef.current);
        bodyClassList.add(theme);
        prevThemeRef.current = theme;

        // In-Chat State: Applies a class when not on the home screen to change backgrounds.
        if (!showHomeScreen) {
            bodyClassList.add('in-chat');
        } else {
            bodyClassList.remove('in-chat');
        }
    }, [theme, showHomeScreen]);
    
    /**
     * Applies a global glow effect to the screen border when any voice mode is active.
     */
    useEffect(() => {
        const bodyClassList = document.body.classList;
        if (isVoiceInputOpen || isLiveVoiceOpen) {
            bodyClassList.add('voice-mode-active-glow');
        } else {
            bodyClassList.remove('voice-mode-active-glow');
        }
        // Cleanup on unmount
        return () => {
            bodyClassList.remove('voice-mode-active-glow');
        }
    }, [isVoiceInputOpen, isLiveVoiceOpen]);
    
    /**
     * Toggles a 'is-typing' class on the body when the message input is focused.
     * Useful for subtle UI changes during input.
     */
    useEffect(() => {
        if(isInputFocused) {
            document.body.classList.add('is-typing');
        } else {
            document.body.classList.remove('is-typing');
        }
    }, [isInputFocused]);

    /**
     * Enables vertical scrolling on the body only when the authentication screen is visible.
     */
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            document.body.classList.add('auth-visible');
        } else {
            document.body.classList.remove('auth-visible');
        }
    }, [authStatus]);


    /**
     * Loads all user-specific data from persistence when a user is authenticated.
     * This includes chat history, settings, and persona instructions.
     */
    useEffect(() => {
        if (currentUser) {
            const loadUserData = async () => {
                const [
                    storedMessages,
                    storedInstruction,
                    storedVoice,
                    storedZoom,
                    storedTheme,
                ] = await Promise.all([
                    getCurrentSession(currentUser.hash),
                    getLiveSystemInstruction(currentUser.hash),
                    getTtsVoice(currentUser.hash),
                    getTextZoom(currentUser.hash),
                    getTheme(currentUser.hash),
                ]);

                if (storedMessages && storedMessages.length > 0) {
                    setMessages(storedMessages);
                    setShowHomeScreen(false);
                } else {
                    setMessages([]);
                    setShowHomeScreen(true);
                }
                setLiveSystemInstruction(storedInstruction ?? initialSystemInstruction);
                setTtsVoice(storedVoice ?? 'Charon');
                setTextZoom(storedZoom ?? 100);
                setTheme(storedTheme ?? 'theme-default');
            };
            loadUserData();
        }
    }, [currentUser]);

    /**
     * Persists the current chat session to local storage whenever messages change.
     */
    useEffect(() => {
        if (currentUser) {
            saveCurrentSession(currentUser.hash, messages);
        }
    }, [messages, currentUser]);
    
    /**
     * Pre-warms the voice preview cache when the selection modal is opened
     * to ensure instantaneous playback for the user.
     */
    useEffect(() => {
        if (isVoiceSelectionOpen) {
            const prewarmVoice = async (voice: string, text: string) => {
                try {
                    const audioContext = getAudioContext();
                    const buffer = await generateSpeech(text, audioContext, voice);
                    if (buffer) {
                        voicePreviewCache.current.set(voice, buffer);
                    }
                } catch (error) {
                    console.error(`Failed to pre-warm voice preview for ${voice}:`, error);
                }
            };
            
            ttsVoices.forEach(voice => {
                if (!voicePreviewCache.current.has(voice.id)) {
                    prewarmVoice(voice.id, voice.previewText);
                }
            });
        }
    }, [isVoiceSelectionOpen]);

    // --- Handlers ---

    const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
        try {
            const user = loginOrSignup(email, password, rememberMe);
            setCurrentUser(user);
            setAuthStatus('authenticated');
        } catch (error) {
            console.error("Login/Signup failed:", error);
            throw error;
        }
    };

    const handleGuest = async () => {
        const user = continueAsGuest();
        setCurrentUser(user);
        setAuthStatus('authenticated');
    };

    const handleLogout = () => {
        if (currentUser) {
            archiveCurrentSession(currentUser.hash).then(() => {
                logout();
                setCurrentUser(null);
                setMessages([]);
                setShowHomeScreen(true);
                setAuthStatus('unauthenticated');
            });
        }
    };

    const handleNewChat = () => {
        if (currentUser) {
            archiveCurrentSession(currentUser.hash).then(() => {
                setMessages([]);
                setShowHomeScreen(true);
            });
        }
    };
    
    const handleSelectSession = (sessionMessages: Message[]) => {
        setMessages(sessionMessages);
        setShowHomeScreen(false);
        setIsHistoryOpen(false);
    };

    const handleCancelGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setIsExtraThinking(false);
        }
    };
    
    const handleSelectAiModel = (model: string) => {
        setCurrentAiModel(model);
    };
    
    const handleTts = useCallback(async (messageId: string, text: string) => {
        if (!text.trim() || !currentUser) return;
        setTtsLoadingMessageId(messageId);
        try {
            const audioContext = getAudioContext();
            const buffer = await generateSpeech(text, audioContext, ttsVoice);
            setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, audioBuffer: buffer } : msg));
        } catch (error) {
            console.error("TTS generation failed:", error);
        } finally {
            setTtsLoadingMessageId(null);
        }
    }, [currentUser, ttsVoice]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        const finalMessage = messageText.trim();
        if ((!finalMessage && attachments.length === 0) || !currentUser) {
            return;
        }

        setIsLoading(true);
        if (showHomeScreen) {
            setShowHomeScreen(false);
        }
        
        // Optimistically add user message to the UI
        const attachmentData: Attachment[] = attachments.map(a => ({ type: 'image', base64: a.base64, mimeType: a.file.type }));
        const newUserMessage: Message = {
            id: crypto.randomUUID(), // Use crypto.randomUUID for unique IDs
            text: finalMessage,
            sender: Sender.User,
            timestamp: new Date().toISOString(),
            attachments: attachmentData,
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setAttachments([]);
        
        // Prepare for API call
        abortControllerRef.current = new AbortController();
        const history = messages; // Pass history BEFORE the new message

        // "Extra Thinking" logic
        if (['Deep Dive', 'Mentor Mode'].includes(currentMode)) {
            const thinkingTimer = setTimeout(() => setIsExtraThinking(true), 2500);
        }

        try {
            const response = await sendMessage(
                finalMessage,
                currentMode,
                history,
                currentUser,
                currentAiModel,
                attachments,
                null,
                {},
                abortControllerRef.current.signal
            );
            
            const aiMessage: Message = {
                id: crypto.randomUUID(), // Use crypto.randomUUID for unique IDs
                text: response.text,
                sender: Sender.AI,
                timestamp: new Date().toISOString(),
                groundingMetadata: response.groundingMetadata,
            };
            
            setMessages(prev => [...prev, aiMessage]);

            const intent = await classifyTextIntent(response.text);
            if (!['violent', 'sexual'].includes(intent)) {
                handleTts(aiMessage.id, response.text);
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Failed to send message:", error);
                const errorMessage: Message = {
                    id: crypto.randomUUID(), // Use crypto.randomUUID for unique IDs
                    text: `Error: ${error.message || 'Could not get a response.'}`,
                    sender: Sender.AI,
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
            setIsExtraThinking(false);
        }
    }, [attachments, currentUser, showHomeScreen, messages, currentMode, currentAiModel, handleTts]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64 = (loadEvent.target?.result as string).split(',')[1];
                setAttachments(prev => [...prev, { file, base64 }]);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddLiveMessages = useCallback((liveMessages: Message[]) => {
        const messagesWithUniqueIds = liveMessages.map(msg => ({
            ...msg,
            id: crypto.randomUUID(), // Ensure unique IDs
        }));
        setMessages(prev => [...prev, ...messagesWithUniqueIds]);
    }, []);

    const handleSelectMode = (mode: string) => {
        setCurrentMode(mode);
        if (showHomeScreen) {
            setSelectedModeForAnimation(mode);
            setShowFieryTransition(true);
        }
    };

    const handleFieryTransitionComplete = () => {
        setShowFieryTransition(false);
        setShowHomeScreen(false);
    };

    // --- Settings Handlers ---
    const handleTextZoomChange = (zoom: number) => {
        setTextZoom(zoom);
        if (currentUser) saveTextZoom(currentUser.hash, zoom);
    };
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        if (currentUser) saveTheme(currentUser.hash, newTheme);
    };
    const handleTtsVoiceChange = (voice: string) => {
        setTtsVoice(voice);
        if (currentUser) saveTtsVoice(currentUser.hash, voice);
    };
     const handleSaveSystemInstruction = (instruction: string) => {
        setLiveSystemInstruction(instruction);
        if (currentUser) saveLiveSystemInstruction(currentUser.hash, instruction);
    };
    
    const handleSaveProfile = async (name: string) => {
        if (currentUser) {
            const updatedUser = await saveCurrentUserName(currentUser.hash, name);
            if (updatedUser) {
                setCurrentUser(updatedUser);
            }
        }
        setIsProfileModalOpen(false);
    };

    const handlePreviewTtsVoice = async (voice: string, text: string) => {
        if (voicePreviewCache.current.has(voice)) {
            return voicePreviewCache.current.get(voice);
        }
        setIsVoicePreviewLoading(voice);
        try {
            const audioContext = getAudioContext();
            const buffer = await generateSpeech(text, audioContext, voice);
            if (buffer) {
                voicePreviewCache.current.set(voice, buffer);
            }
            return buffer;
        } catch (error) {
            console.error(`Failed to generate preview for ${voice}:`, error);
        } finally {
            setIsVoicePreviewLoading(null);
        }
    };

    // --- Component Rendering Logic ---

    if (authStatus === 'loading') {
        return <InitialLoading />;
    }

    if (authStatus === 'unauthenticated') {
        return (
             <div className="h-full flex flex-col">
                <div ref={appContainerRef} className="flex-1 flex flex-col">
                    <AuthScreen onLogin={handleLogin} onGuest={handleGuest} onForgotPassword={() => setIsForgotPasswordOpen(true)} />
                </div>
                <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
             </div>
        );
    }
    
    if (isAgeGated) {
        return <AgeGatingModal onAgree={() => setIsAgeGated(false)} />;
    }
    
    return (
        <AudioPlayerProvider>
            <div 
                className="h-full flex flex-col bg-black relative overflow-hidden"
            >
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div ref={appContainerRef} className="flex-1 flex flex-col min-h-0 relative">
                        <div className="z-40">
                            <Header 
                                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                                onNewChat={handleNewChat}
                                showHomeScreen={showHomeScreen}
                                onGoHome={() => setShowHomeScreen(true)}
                                onOpenBugModal={() => setIsBugModalOpen(true)}
                                currentMode={currentMode}
                                onModeChange={setCurrentMode}
                            />
                        </div>
                        {/* Main Content Wrapper */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <main className="flex-1 flex flex-col overflow-y-auto smooth-scroll">
                        {showHomeScreen ? (
                            <Home 
                                onSelectMode={handleSelectMode}
                                onAnimationComplete={() => {}}
                                currentMode={currentMode}
                                selectedModeForAnimation={selectedModeForAnimation}
                            />
                        ) : (
                            <ChatWindow 
                                messages={messages} 
                                isLoading={isLoading} 
                                isExtraThinking={isExtraThinking}
                                onCancelGeneration={handleCancelGeneration}
                                textZoom={textZoom}
                                ttsLoadingMessageId={ttsLoadingMessageId}
                            />
                        )}
                    </main>
                    {!showHomeScreen && (
                        <MessageInput 
                            input={input} 
                            setInput={setInput} 
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            isListening={isVoiceInputOpen}
                            onToggleListening={() => setIsVoiceInputOpen(!isVoiceInputOpen)}
                            onToggleLiveVoiceMode={() => setIsLiveVoiceOpen(true)}
                            attachments={attachments}
                            onFileSelect={handleFileSelect}
                            onRemoveAttachment={(index) => setAttachments(prev => prev.filter((_, i) => i !== index))}
                            setIsInputFocused={setIsInputFocused}
                        />
                    )}
                </div>
            </div>

                {/* Modals and Overlays - These stay active even when main content is inert */}
                {currentUser && (
                    <Menu
                        isOpen={isMenuOpen}
                        onClose={() => setIsMenuOpen(false)}
                        onLogout={handleLogout}
                        onViewHistory={() => setIsHistoryOpen(true)}
                        currentAiModel={currentAiModel}
                        onSelectAiModel={handleSelectAiModel}
                        onOpenAppearance={() => setIsAppearanceOpen(true)}
                        onOpenVoiceSelection={() => setIsVoiceSelectionOpen(true)}
                        onOpenModeSelection={() => setIsModeSelectionOpen(true)}
                        currentUser={currentUser}
                        onGoToAuth={handleLogout}
                        onOpenProfileModal={() => setIsProfileModalOpen(true)}
                        onOpenMemoryVault={() => setIsMemoryVaultOpen(true)}
                    />
                )}
                {currentUser && <ChatHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onSelectSession={handleSelectSession} currentUser={currentUser} onSignUp={handleLogout} />}
                <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} textZoom={textZoom} onTextZoomChange={handleTextZoomChange} currentTheme={theme} onThemeChange={handleThemeChange} />
                <VoiceSelectionModal 
                    isOpen={isVoiceSelectionOpen} 
                    onClose={() => setIsVoiceSelectionOpen(false)} 
                    currentTtsVoice={ttsVoice} 
                    onSelectTtsVoice={handleTtsVoiceChange} 
                    onPreviewTtsVoice={handlePreviewTtsVoice}
                    isVoicePreviewLoading={isVoicePreviewLoading}
                    ttsVoices={ttsVoices}
                />
                <ModeSelectionModal isOpen={isModeSelectionOpen} onClose={() => setIsModeSelectionOpen(false)} onSelectMode={setCurrentMode} currentMode={currentMode} />
                <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
                {isVoiceInputOpen && <VoiceInputOverlay onClose={() => setIsVoiceInputOpen(false)} onSend={handleSendMessage} />}
                {isLiveVoiceOpen && <LiveVoiceModeOverlay onClose={() => setIsLiveVoiceOpen(false)} onAddLiveMessages={handleAddLiveMessages} systemInstruction={liveSystemInstruction} />}
                {currentUser && <NexusAndChillModal isOpen={isNexusAndChillOpen} onClose={() => setIsNexusAndChillOpen(false)} currentUser={currentUser} />}
                {currentUser && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentUser={currentUser} onSave={handleSaveProfile} />}
                {currentUser && <MemoryVaultModal isOpen={isMemoryVaultOpen} onClose={() => setIsMemoryVaultOpen(false)} currentUser={currentUser} />}
                <FieryTransition isActive={showFieryTransition} onComplete={handleFieryTransitionComplete} />
                <div className="global-edge-glow"></div>
            </div>
        </AudioPlayerProvider>
    );
};

export default App;