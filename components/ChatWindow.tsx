import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { WatermarkIcon } from './WatermarkIcon';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isExtraThinking: boolean;
  onCancelGeneration: () => void;
  textZoom: number;
  ttsLoadingMessageId: string | null;
}

/**
 * Renders the animated background elements for the chat window, including stars,
 * particle effects, and theme-specific visuals. This component is computationally
 * expensive, so it is memoized to prevent re-renders on every message change.
 */
const ChatBackground: React.FC<{ isExtraThinking: boolean }> = ({ isExtraThinking }) => {
    // Generate an array of particle elements for the default 'Nexus' theme.
    const particles = Array.from({ length: 15 }).map((_, i) => {
        const duration = Math.random() * 5 + 4; // 4s to 9s
        const delay = Math.random() * 8; // 0s to 8s
        const xDrift = (Math.random() - 0.5) * 200; // -100 to 100 drift
        const startLeft = Math.random() * 100; // 0% to 100%
        
        return (
            <div
                key={`nexus-${i}`}
                className="nexus-particle"
                style={{
                    left: `${startLeft}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    '--x-drift': xDrift,
                } as React.CSSProperties & { '--x-drift': number }}
            />
        );
    });

    // Generate an array of fire particle elements for the 'Crimson Hell' theme.
    const fireParticles = Array.from({ length: 20 }).map((_, i) => {
        const duration = Math.random() * 3 + 2; // 2s to 5s
        const delay = Math.random() * 4; // 0s to 4s
        const startLeft = Math.random() * 100; // 0% to 100%
        return (
            <div
                key={`fire-${i}`}
                className="fire-particle"
                style={{
                    left: `${startLeft}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                }}
            />
        );
    });

    // Generate twinkling star elements.
    const stars = Array.from({ length: 40 }).map((_, i) => {
        const duration = Math.random() * 2 + 1.5; // 1.5s to 3.5s
        const delay = Math.random() * 3; // 0 to 3s
        const top = Math.random() * 25; // Constrain stars to the top 25% of the screen
        const left = Math.random() * 100;
        const size = Math.random() * 1 + 0.5; // 0.5px to 1.5px

        const style = {
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
        };
        return (
            <div
                key={`star-${i}`}
                className="star-particle"
                style={style as React.CSSProperties}
            />
        );
    });

    // Generate brighter twinkling star elements.
    const brightStars = Array.from({ length: 15 }).map((_, i) => {
        const duration = Math.random() * 1.5 + 1; // 1s to 2.5s
        const delay = Math.random() * 5; 
        const top = Math.random() * 30; 
        const left = Math.random() * 100;
        const size = Math.random() * 2 + 1; // 1px to 3px

        const style = {
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `twinkle-bright ${duration}s ease-in-out ${delay}s infinite`,
        };
        return <div key={`bright-star-${i}`} className="star-particle" style={style as React.CSSProperties} />;
    });

    // Generate tiny rising embers.
    const embers = Array.from({ length: 30 }).map((_, i) => {
        const duration = Math.random() * 4 + 3; // 3s to 7s
        const delay = Math.random() * 6;
        const xDrift = (Math.random() - 0.5) * 100;
        const startLeft = Math.random() * 100;
        const startScale = Math.random() * 0.5 + 0.5; // 0.5 to 1

        return (
            <div
                key={`ember-${i}`}
                className="ember-particle"
                style={{
                    left: `${startLeft}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    '--x-drift': `${xDrift}px`,
                    '--start-scale': startScale,
                } as React.CSSProperties & { '--x-drift': string; '--start-scale': number }}
            />
        );
    });

    // Generate subtle black smoke.
    const smokePlumes = Array.from({ length: 6 }).map((_, i) => {
        const duration = Math.random() * 10 + 15; // 15s to 25s
        const delay = Math.random() * 20;
        const xDrift = (Math.random() - 0.5) * 200;
        const startLeft = Math.random() * 80 + 10;

        return (
            <div
                key={`smoke-${i}`}
                className="smoke-particle"
                style={{
                    left: `${startLeft}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    '--x-drift': `${xDrift}px`,
                } as React.CSSProperties & { '--x-drift': string }}
            />
        );
    });
    
    // Generate subtle floating clouds/nebulae.
    const clouds = Array.from({ length: 3 }).map((_, i) => {
        const duration = Math.random() * 60 + 90; // 90s to 150s
        const delay = (duration / 3) * i; // Stagger them
        const top = Math.random() * 40; // 0% to 40% from top

        return (
            <div
                key={`cloud-${i}`}
                className="cloud-particle"
                style={{
                    top: `${top}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                }}
            />
        );
    });
    
    // Generate shooting star elements.
    const shootingStars = Array.from({ length: 2 }).map((_, i) => {
        const duration = Math.random() * 5 + 5; // 5s to 10s
        const delay = Math.random() * 10;
        const top = Math.random() * 50 - 10; // -10% to 40%
        return (
             <div
                key={`shooting-star-${i}`}
                className="shooting-star"
                style={{
                    top: `${top}%`,
                    right: '-100px',
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                }}
            />
        );
    });

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${isExtraThinking ? 'extra-thinking-active' : ''}`}>
                <div className="watermark-container w-1/3 relative">
                    <div className="watermark-icon-wrapper">
                         <WatermarkIcon />
                    </div>
                </div>
            </div>

            {clouds}
            {stars}
            {brightStars}
            {shootingStars}
            {smokePlumes}
            {/* Rising particles now rendered BEHIND the glow */}
            {particles}
            {fireParticles}
            {embers}
            <div className="nexus-core-glow"></div>
            <div className="nexus-core-pulse"></div>

            {/* Theme-specific elements that are toggled via CSS */}
            <div className="devil-emoji">😈</div>
            <div className="drip-container">
                <div className="drip" style={{ left: '10%', animationDelay: '0s' }}></div>
                <div className="drip" style={{ left: '85%', animationDelay: '1.5s' }}></div>
                <div className="drip" style={{ left: '50%', animationDelay: '3s' }}></div>
            </div>
            <div className="steam-container">
                <div className="steam" style={{ left: '20%', bottom: '-100px', animationDelay: '0.5s' }}></div>
                <div className="steam" style={{ left: '70%', bottom: '-100px', animationDelay: '2.5s' }}></div>
            </div>
        </div>
    );
};

// Memoize the background to prevent re-renders, as it's visually complex but static.
const MemoizedChatBackground = React.memo(ChatBackground);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, isExtraThinking, onCancelGeneration, textZoom, ttsLoadingMessageId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col relative transition-colors duration-1000" style={{ background: `linear-gradient(to bottom, var(--chat-bg-dark) 0%, var(--chat-bg-light) 100%)`}}>
        <MemoizedChatBackground isExtraThinking={isExtraThinking} />
        <div className="p-4 md:p-6 space-y-8 relative z-10">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} textZoom={textZoom} ttsLoadingMessageId={ttsLoadingMessageId} />
            ))}
            {isLoading && <TypingIndicator onCancelGeneration={onCancelGeneration} isExtraThinking={isExtraThinking} />}
            {/* This empty div is the target for auto-scrolling */}
            <div ref={messagesEndRef} />
        </div>
    </div>
  );
};