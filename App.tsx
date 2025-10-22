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

import { loginOrSignup, continueAsGuest, getCurrentUser, logout } from './services/authService';
import { archiveCurrentSession } from './services/chatHistoryService';
import { sendMessageToDialogflow } from './services/dialogflowService';
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

const App: React.FC = () => {
    // Auth state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    // UI state
    const [showIntro, setShowIntro] = useState(true);
    const [showHomeScreen, setShowHomeScreen] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAgeGated, setIsAgeGated] = useState(localStorage.getItem('darenNexusAgeGate') !== 'true');
    const [isInputFocused, setIsInputFocused] = useState(false);
    
    // Home screen animation/transition state
    const [selectedModeForAnimation, setSelectedModeForAnimation] = useState<string | null>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Modal states
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
    const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);
    const [isModeSelectionOpen, setIsModeSelectionOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
    const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
    const [isVoicePreviewLoading, setIsVoicePreviewLoading] = useState<string | null>(null);
    const [isNexusAndChillOpen, setIsNexusAndChillOpen] = useState(false);


    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<{ file: File; base64: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Settings state
    const [currentMode, setCurrentMode] = useState('Real Talk');
    const [currentAiModel, setCurrentAiModel] = useState('gemini-2.5-flash');
    const [ttsVoice, setTtsVoice] = useState('Fenrir');
    const [textZoom, setTextZoom] = useState(100);
    const [theme, setTheme] = useState('theme-default');
    const [liveSystemInstruction, setLiveSystemInstruction] = useState(initialSystemInstruction);

    // --- Effects ---
    
    const prevThemeRef = useRef(theme);

    useEffect(() => {
        const bodyClassList = document.body.classList;
        
        // Theme Management: Remove previous theme, add current theme
        bodyClassList.remove(prevThemeRef.current);
        bodyClassList.add(theme);
        prevThemeRef.current = theme;

        // In-Chat State
        if (!showHomeScreen) {
            bodyClassList.add('in-chat');
        } else {
            bodyClassList.remove('in-chat');
        }
    }, [theme, showHomeScreen]);
    
    useEffect(() => {
        if(isInputFocused) {
            document.body.classList.add('is-typing');
        } else {
            document.body.classList.remove('is-typing');
        }
    }, [isInputFocused]);

    // This effect handles the scrolling on the auth page.
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            document.body.classList.add('auth-visible');
        } else {
            document.body.classList.remove('auth-visible');
        }
    }, [authStatus]);


    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setAuthStatus('authenticated');
        } else {
            setAuthStatus('unauthenticated');
        }
    }, []);

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

    useEffect(() => {
        if (currentUser) {
            saveCurrentSession(currentUser.hash, messages);
        }
    }, [messages, currentUser]);

    // --- Handlers ---

    const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
        const user = loginOrSignup(username, password, rememberMe);
        setCurrentUser(user);
        setAuthStatus('authenticated');
    };

    const handleGuest = async () => {
        const user = continueAsGuest();
        setCurrentUser(user);
        setAuthStatus('authenticated');
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
    
    const handleCancelGeneration = () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsLoading(false);
        }
    };
    
    const handleSendMessage = useCallback(async (messageText: string) => {
        if (isLoading || (!messageText.trim() && attachments.length === 0)) return;
        if (!currentUser) return;
    
        // --- Trigger Phrase Checks ---
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
        setShowHomeScreen(false);
        setInput('');
    
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
        
        let messagesToSend = [...messages, userMessage];
        setMessages(messagesToSend);
    
        // Check for sexual content to trigger theme change
        const intent = await classifyTextIntent(messageText);
        if (intent === 'sexual' && theme !== 'theme-crimson') {
            handleThemeChange('theme-crimson');
            const transitionMessage: Message = {
                id: (Date.now() + 0.5).toString(),
                text: "mmm okk... shit! It's getting HOT in this mofo. 🔥😈💦",
                sender: Sender.AI,
                timestamp: new Date().toISOString()
            };
            // Add transition message to history for context
            messagesToSend = [...messagesToSend, transitionMessage];
            setMessages(messagesToSend);
        }
        
        const currentAttachments = [...attachments];
        setAttachments([]);
        
        try {
            const aiResponseText = await sendMessageToDialogflow(
                messageText,
                currentMode,
                messagesToSend,
                liveSystemInstruction,
                currentUser,
                currentAiModel,
                currentAttachments
            );
    
            const aiMessageId = (Date.now() + 1).toString();
            const aiMessage: Message = {
                id: aiMessageId,
                text: aiResponseText,
                sender: Sender.AI,
                timestamp: new Date().toISOString(),
            };
    
            // Add the text message first and stop loading
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
    
            // Now, generate speech in the background and update the message
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBuffer = await generateSpeech(aiResponseText, audioContext, ttsVoice);
                
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, audioBuffer } : msg
                ));
            } catch (speechError) {
                console.error("Error generating speech after response:", speechError);
                // The text is already displayed, so we don't need to show another error message in the chat.
            }
    
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I ran into an error. Please try again.",
                sender: Sender.AI,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false); // Also stop loading on error
        }
    }, [isLoading, attachments, currentUser, currentMode, messages, liveSystemInstruction, currentAiModel, ttsVoice, theme]);

    const handleSelectMode = (mode: string) => {
        setSelectedModeForAnimation(mode);
        setTimeout(() => {
            setCurrentMode(mode);
            setShowHomeScreen(false);
            setSelectedModeForAnimation(null);
        }, 1000); // 1s for animation
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

    // --- Render Logic ---

    if (authStatus === 'loading') {
        return <InitialLoading />;
    }

    if (authStatus === 'unauthenticated') {
        return (
            <div className="w-full min-h-full flex items-center justify-center">
                <AuthScreen onLogin={handleLogin} onGuest={handleGuest} />
            </div>
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
        <div className={`w-full h-full flex flex-col font-sans transition-colors duration-500 global-edge-glow`}>
            <Header
                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                onNewChat={handleNewChat}
                showHomeScreen={showHomeScreen}
                onGoHome={() => setShowHomeScreen(true)}
                onOpenBugModal={() => setIsBugModalOpen(true)}
                currentMode={currentMode}
                onModeChange={setCurrentMode}
            />

            {isMenuOpen && (
                <Menu
                    onLogout={handleLogout}
                    onViewHistory={() => { setIsHistoryOpen(true); setIsMenuOpen(false); }}
                    currentAiModel={currentAiModel}
                    onSelectAiModel={setCurrentAiModel}
                    onOpenAppearance={() => { setIsAppearanceOpen(true); setIsMenuOpen(false); }}
                    onOpenVoiceSelection={() => { setIsVoiceSelectionOpen(true); setIsMenuOpen(false); }}
                    onOpenModeSelection={() => { setIsModeSelectionOpen(true); setIsMenuOpen(false); }}
                />
            )}
            
            <main ref={mainContentRef} className={`flex-1 flex flex-col overflow-y-auto min-h-0`}>
                {showHomeScreen ? (
                    <Home onSelectMode={handleSelectMode} onAnimationComplete={handleAnimationComplete} />
                ) : (
                    <ChatWindow messages={messages} isLoading={isLoading} onCancelGeneration={handleCancelGeneration} textZoom={textZoom} />
                )}
            </main>

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

            {/* Modals */}
            {currentUser && <ChatHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onSelectSession={handleSelectSession} userHash={currentUser.hash} />}
            <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} textZoom={textZoom} onTextZoomChange={handleTextZoomChange} currentTheme={theme} onThemeChange={handleThemeChange} />
            <VoiceSelectionModal isOpen={isVoiceSelectionOpen} onClose={() => setIsVoiceSelectionOpen(false)} currentTtsVoice={ttsVoice} onSelectTtsVoice={handleVoiceChange} onPreviewTtsVoice={handlePreviewTtsVoice} isVoicePreviewLoading={isVoicePreviewLoading} />
            <ModeSelectionModal isOpen={isModeSelectionOpen} onClose={() => setIsModeSelectionOpen(false)} onSelectMode={handleSelectMode} />
            <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
            {isVoiceInputOpen && <VoiceInputOverlay onClose={() => setIsVoiceInputOpen(false)} onSend={handleSendMessage} />}
            {isLiveVoiceOpen && <LiveVoiceModeOverlay onClose={() => setIsLiveVoiceOpen(false)} onAddLiveMessages={(msgs) => setMessages(prev => [...prev, ...msgs])} systemInstruction={liveSystemInstruction} />}
            {currentUser && <NexusAndChillModal isOpen={isNexusAndChillOpen} onClose={() => setIsNexusAndChillOpen(false)} currentUser={currentUser} />}
        </div>
      </AudioPlayerProvider>
    );
}

export default App;