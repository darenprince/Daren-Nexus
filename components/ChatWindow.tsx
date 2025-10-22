import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onCancelGeneration: () => void;
  textZoom: number;
}

const ChatBackground: React.FC = () => {
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
            {stars}
            {shootingStars}
            <div className="nexus-core-glow"></div>
            <div className="nexus-core-pulse"></div>
            {particles}
            {fireParticles}
            {/* Theme-specific elements */}
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


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onCancelGeneration, textZoom }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col relative transition-colors duration-1000" style={{ background: `radial-gradient(ellipse at 50% 100%, var(--chat-bg-light) 0%, var(--chat-bg-dark) 70%)`}}>
        <ChatBackground />
        <div className="p-4 md:p-6 space-y-8 relative z-10">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} textZoom={textZoom} />
            ))}
            {isLoading && <TypingIndicator onCancelGeneration={onCancelGeneration} />}
            <div ref={messagesEndRef} />
        </div>
    </div>
  );
};