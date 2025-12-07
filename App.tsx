import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChatHistory } from './components/ChatHistory';
import { ChatWindow } from './components/ChatWindow';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { InitialLoading } from './components/InitialLoading';
import { Intro } from './components/Intro';
import { Menu } from './components/Menu';
import { MessageInput } from './components/MessageInput';
import { AppearanceModal } from './components/AppearanceModal';
import { VoiceSelectionModal } from './components/VoiceSelectionModal';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { BugReportModal } from './components/BugReportModal';
import { VoiceInputOverlay } from './components/VoiceInputOverlay';
import { AgeGatingModal } from './components/AgeGatingModal';
import { LiveVoiceModeOverlay } from './components/LiveVoiceModeOverlay';
import { NexusAndChillModal } from './components/NexusAndChillModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ProfileModal } from './components/ProfileModal';
import { MemoryVaultModal } from './components/MemoryVaultModal';

import { loginOrSignup, continueAsGuest, getCurrentUser, logout, saveCurrentUserName } from './services/authService';
import { archiveCurrentSession } from './services/chatHistoryService';
import { sendMessage } from './services/dialogflowService';
import { generateSpeech, classifyTextIntent } from './services/geminiService';
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
} from './services/persistenceService';
import { initialSystemInstruction } from './services/persona';

import type { Message, User, Attachment } from './types';
import { Sender } from './types';

import { AudioPlayerProvider } from './contexts/AudioPlayerContext';

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
    const [showIntro, setShowIntro] = useState(true);
    const [showHomeScreen, setShowHomeScreen] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAgeGated, setIsAgeGated] = useState(localStorage.getItem('darenNexusAgeGate') !== 'true');
    const [isInputFocused, setIsInputFocused] = useState(false);
    
    // Home screen animation state for smooth transitions.
    const [selectedModeForAnimation, setSelectedModeForAnimation] = useState<string | null>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);
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
    const [currentAiModel, setCurrentAiModel] = useState('gemini-2.5-pro'); // Default model set to Pro
    const [ttsVoice, setTtsVoice] = useState('Fenrir');
    const [textZoom, setTextZoom] = useState(100);
    const [theme, setTheme] = useState('theme-default');
    const [liveSystemInstruction, setLiveSystemInstruction] = useState(initialSystemInstruction);

    // --- Effects ---
    
    const prevThemeRef = useRef(theme);
    
    // Accessibility: Determine if any modal is open to hide background content.
    const isModalOpen = isHistoryOpen || isAppearanceOpen || isVoiceSelectionOpen || isModeSelectionOpen || isBugModalOpen || isVoiceInputOpen || isLiveVoiceOpen || isNexusAndChillOpen || isForgotPasswordOpen || isProfileModalOpen || isMemoryVaultOpen;

    /**
     * ACCESSIBILITY: Hides the main app content from screen readers and keyboard
     * navigation when a modal is open.
     */
    useEffect(() => {
        const appContainer = appContainerRef.current;
        if (appContainer) {
            if (isModalOpen) {
                appContainer.setAttribute('aria-hidden', 'true');
                appContainer.setAttribute('inert', '');
            } else {
                appContainer.removeAttribute('aria-hidden');
                appContainer.removeAttribute('inert');
            }
        }
    }, [isModalOpen]);


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
            bodyClassList.remove('in--chat');
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
     * Checks for a current user session on initial application load.
     * Sets the authentication status accordingly.
     */
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setAuthStatus('authenticated');
        } else {
            setAuthStatus('unauthenticated');
        }
    }, []);

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
                setTtsVoice(storedVoice ?? 'Fenrir');
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

    // --- Handlers ---

    const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
        const user = loginOrSignup(email, password, rememberMe);
        setCurrentUser(user);
        setAuthStatus('authenticated');
    };

    const handleGuest = async () => {
        const user = continueAsGuest();
        setCurrentUser(user);
        setAuthStatus('authenticated');
    };
    
    const handleGoToAuth = () => {
        setIsMenuOpen(false);
        setIsHistoryOpen(false); // Close any open modals
        // Delay auth change to allow modals to close gracefully
        setTimeout(() => {
          logout(); // This clears hashes from storage
          setCurrentUser(null);
          setMessages([]);
          setAuthStatus('unauthenticated');
        }, 300);
    };

    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        setMessages([]);
        setAuthStatus('unauthenticated');
    };

    const handleAgeGateAgree = () => {
        localStorage.setItem('darenNexusAgeGate', 'true');
        setIsAgeGated(false);
    };

    /**
     * Archives the current chat session (if it has content) and starts a new one.
     */
    const handleNewChat = async () => {
        if (!currentUser) return;
        if (messages.length > 0) {
            await archiveCurrentSession(currentUser.hash);
        }
        setMessages([]);
        setShowHomeScreen(true);
        setIsMenuOpen(false);
    };

    const handleSelectSession = (sessionMessages: Message[]) => {
        setMessages(sessionMessages);
        setShowHomeScreen(false);
        setIsHistoryOpen(false);
    };
    
    /**
     * Aborts the in-flight API request for generating an AI response.
     */
    const handleCancelGeneration = () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
    };
    
    /**
     * The core function for sending a message. It handles trigger phrases,
     * sends the message to the backend, and processes the AI's response,
     * including initiating background text-to-speech generation.
     */
    const handleSendMessage = useCallback(async (messageText: string) => {
        if (isLoading || (!messageText.trim() && attachments.length === 0)) return;
        if (!currentUser) return;
    
        // --- Trigger Phrase Checks for special client-side actions ---
        const lowerCaseText = messageText.trim().toLowerCase();
        if (lowerCaseText === 'nexus who') {
            window.open('/nexus-who.html', '_blank');
            return;
        }
        if (['can i come over', 'nexus and chill', 'nexus & chill'].includes(lowerCaseText)) {
            setIsNexusAndChillOpen(true);
            return;
        }
    
        setIsLoading(true);
        if (['Deep Dive', 'Mentor Mode'].includes(currentMode)) {
            setIsExtraThinking(true);
        }

        setShowHomeScreen(false);
        setInput('');

        abortControllerRef.current = new AbortController();
    
        const userMessageAttachments: Attachment[] = attachments.map(a => ({
            type: 'image',
            base64: a.base64,
            mimeType: a.file.type,
        }));
    
        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: Sender.User,
            timestamp: new Date().toISOString(),
            attachments: userMessageAttachments,
        };
        
        // History for the API call does NOT include the new user message.
        const historyForApi = [...messages];
        // Messages to add to the UI state.
        const newUiMessages: Message[] = [userMessage];

        const currentAttachments = [...attachments];
        setAttachments([]);
        
        // Handle intent classification and add UI-only transition message if needed
        const intent = await classifyTextIntent(messageText);
        if (intent === 'sexual' && theme !== 'theme-crimson') {
            handleThemeChange('theme-crimson');
            const transitionMessage: Message = {
                id: (Date.now() + 0.5).toString(),
                text: "mmm okk... shit! It's getting HOT in this mofo. 🔥😈💦",
                sender: Sender.AI,
                timestamp: new Date().toISOString()
            };
            newUiMessages.push(transitionMessage);
        }

        // Update UI state once with all new messages for this turn.
        setMessages(prev => [...prev, ...newUiMessages]);

        try {
            // Send the clean history and the new message text to the backend.
            const response = await sendMessage(
                messageText,
                currentMode,
                historyForApi, // Clean history
                currentUser ?? undefined,
                currentAiModel,
                currentAttachments,
                null, // quotedMessage
                {}, // options
                abortControllerRef.current.signal
            );
    
            const aiResponseText = response.text;
            const groundingMetadata = response.groundingMetadata;

            const aiMessageId = (Date.now() + 1).toString();
            const aiMessage: Message = {
                id: aiMessageId,
                text: aiResponseText,
                sender: Sender.AI,
                timestamp: new Date().toISOString(),
                groundingMetadata: groundingMetadata,
            };
    
            // Add the text message first to provide a fast response to the user.
            setMessages(prev => [...prev, aiMessage]);
    
            // Now, generate speech in the background and update the message with the audio buffer.
            try {
                setTtsLoadingMessageId(aiMessageId);
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBuffer = await generateSpeech(aiResponseText, audioContext, ttsVoice);
                
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, audioBuffer } : msg
                ));
            } catch (speechError) {
                console.error("Error generating speech after response:", speechError);
            } finally {
                setTtsLoadingMessageId(null);
            }
    
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Message generation cancelled by user.');
                // Revert the UI state by removing the messages we just added.
                setMessages(historyForApi); 
                setIsLoading(false);
                setIsExtraThinking(false);
                return;
            }

            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: error.message || "Sorry, I ran into an error. Please try again.",
                sender: Sender.AI,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsExtraThinking(false);
            abortControllerRef.current = null;
        }
    }, [isLoading, attachments, currentUser, currentMode, messages, liveSystemInstruction, currentAiModel, ttsVoice, theme]);

    /**
     * Handles the selection of a new "vibe" from the home screen,
     * triggering a transition animation before switching to the chat view.
     */
    const handleSelectMode = (mode: string) => {
        setSelectedModeForAnimation(mode);
        setTimeout(() => {
            setCurrentMode(mode);
            setShowHomeScreen(false);
            setSelectedModeForAnimation(null);
        }, 2000); // 2-second delay allows the user to see the selection animation.
    };
    
    const handleAnimationComplete = useCallback(() => {
      mainContentRef.current?.scrollTo({
        top: mainContentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, []);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        if (currentUser) saveTheme(currentUser.hash, newTheme);
    };

    const handleTextZoomChange = (zoom: number) => {
        setTextZoom(zoom);
        if (currentUser) saveTextZoom(currentUser.hash, zoom);
    };
    
    const handleVoiceChange = (voice: string) => {
        setTtsVoice(voice);
        if (currentUser) saveTtsVoice(currentUser.hash, voice);
    };

    /**
     * Generates and plays a preview of a TTS voice.
     */
    const handlePreviewTtsVoice = async (voice: string, text: string) => {
        setIsVoicePreviewLoading(voice);
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const buffer = await generateSpeech(text, audioContext, voice);
            return buffer;
        } catch (error) {
            console.error("Error previewing voice:", error);
        } finally {
            setIsVoicePreviewLoading(null);
        }
    };
    
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64 = (loadEvent.target?.result as string).split(',')[1];
                setAttachments(prev => [...prev, { file, base64 }]);
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const handleRemoveAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveProfile = async (newName: string) => {
        if (currentUser && !currentUser.isGuest) {
            const updatedUser = await saveCurrentUserName(currentUser.hash, newName);
            if (updatedUser) {
                setCurrentUser(updatedUser);
            }
            setIsProfileModalOpen(false);
        }
    };

    // --- Render Logic ---

    if (authStatus === 'loading') {
        return <InitialLoading />;
    }

    if (authStatus === 'unauthenticated') {
        return (
            <>
                <div className="w-full min-h-full flex items-center justify-center animate-auth-emerge opacity-0">
                    <AuthScreen onLogin={handleLogin} onGuest={handleGuest} onForgotPassword={() => setIsForgotPasswordOpen(true)} />
                </div>
                <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
            </>
        );
    }
    
    if (!currentUser) {
       return <div className="w-full min-h-full flex items-center justify-center"><p>Error: No user found.</p></div>;
    }

    if (showIntro) {
        return <Intro onIntroComplete={() => setShowIntro(false)} />;
    }

    if (isAgeGated) {
        return <AgeGatingModal onAgree={handleAgeGateAgree} />;
    }

    return (
      <AudioPlayerProvider>
        <div ref={appContainerRef} className={`w-full h-full flex flex-col font-sans transition-colors duration-500 global-edge-glow`}>
            <Header
                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                onNewChat={handleNewChat}
                showHomeScreen={showHomeScreen}
                onGoHome={() => setShowHomeScreen(true)}
                onOpenBugModal={() => setIsBugModalOpen(true)}
                currentMode={currentMode}
                onModeChange={setCurrentMode}
            />

            <Menu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onLogout={handleLogout}
                onViewHistory={() => { setIsHistoryOpen(true); setIsMenuOpen(false); }}
                currentAiModel={currentAiModel}
                onSelectAiModel={setCurrentAiModel}
                onOpenAppearance={() => { setIsAppearanceOpen(true); setIsMenuOpen(false); }}
                onOpenVoiceSelection={() => { setIsVoiceSelectionOpen(true); setIsMenuOpen(false); }}
                onOpenModeSelection={() => { setIsModeSelectionOpen(true); setIsMenuOpen(false); }}
                currentUser={currentUser}
                onGoToAuth={handleGoToAuth}
                onOpenProfileModal={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                onOpenMemoryVault={() => { setIsMemoryVaultOpen(true); setIsMenuOpen(false); }}
            />
            
            <main ref={mainContentRef} className={`flex-1 flex flex-col overflow-y-auto min-h-0 smooth-scroll`}>
                {showHomeScreen ? (
                    <Home onSelectMode={handleSelectMode} onAnimationComplete={handleAnimationComplete} currentMode={currentMode} selectedModeForAnimation={selectedModeForAnimation} />
                ) : (
                    <ChatWindow messages={messages} isLoading={isLoading} isExtraThinking={isExtraThinking} onCancelGeneration={handleCancelGeneration} textZoom={textZoom} ttsLoadingMessageId={ttsLoadingMessageId} />
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
                    onRemoveAttachment={handleRemoveAttachment}
                    setIsInputFocused={setIsInputFocused}
                />
            )}
        </div>

        {/* Modals are rendered outside the main app container for accessibility */}
        {currentUser && <ChatHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onSelectSession={handleSelectSession} currentUser={currentUser} onSignUp={handleGoToAuth} />}
        <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} textZoom={textZoom} onTextZoomChange={handleTextZoomChange} currentTheme={theme} onThemeChange={handleThemeChange} />
        <VoiceSelectionModal isOpen={isVoiceSelectionOpen} onClose={() => setIsVoiceSelectionOpen(false)} currentTtsVoice={ttsVoice} onSelectTtsVoice={handleVoiceChange} onPreviewTtsVoice={handlePreviewTtsVoice} isVoicePreviewLoading={isVoicePreviewLoading} />
        <ModeSelectionModal isOpen={isModeSelectionOpen} onClose={() => setIsModeSelectionOpen(false)} onSelectMode={handleSelectMode} currentMode={currentMode} />
        <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
        <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentUser={currentUser} onSave={handleSaveProfile} />
        {currentUser && <MemoryVaultModal isOpen={isMemoryVaultOpen} onClose={() => setIsMemoryVaultOpen(false)} currentUser={currentUser} />}
        {isVoiceInputOpen && <VoiceInputOverlay onClose={() => setIsVoiceInputOpen(false)} onSend={handleSendMessage} />}
        {isLiveVoiceOpen && <LiveVoiceModeOverlay onClose={() => setIsLiveVoiceOpen(false)} onAddLiveMessages={(msgs) => setMessages(prev => [...prev, ...msgs])} systemInstruction={liveSystemInstruction} />}
        {currentUser && <NexusAndChillModal isOpen={isNexusAndChillOpen} onClose={() => setIsNexusAndChillOpen(false)} currentUser={currentUser} />}
        <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
      </AudioPlayerProvider>
    );
}

export default App;