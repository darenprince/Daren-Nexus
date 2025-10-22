import React, { useState, useEffect } from 'react';
import { NexusOrb } from './NexusOrb';
import { LoadingAnimation } from './LoadingAnimation';
import { ModeTiles } from './ModeTiles';
import { Embers } from './Embers';
import { LogoIcon } from './LogoIcon';

interface HomeProps {
  onSelectMode: (mode: string) => void;
  onAnimationComplete: () => void;
}

const H1_FULL_TEXT = "Sup? I'm Daren";
const P1_FULL_TEXT = "Ask me anything";
const P2_FULL_TEXT = "Let's get into it. What's the vibe?";
const TYPING_SPEED = 50; // ms per character

export const Home: React.FC<HomeProps> = ({ onSelectMode, onAnimationComplete }) => {
    const [showIntroAnimation, setShowIntroAnimation] = useState(false);
    const [isFlameVisible, setIsFlameVisible] = useState(false);
    const [igniteFlame, setIgniteFlame] = useState(false);
    const [typingStep, setTypingStep] = useState(0); // 0: idle, 1: h1, 2: p1, 3: p2, 4: done
    const [h1Text, setH1Text] = useState('');
    const [p1Text, setP1Text] = useState('');
    const [p2Text, setP2Text] = useState('');


    useEffect(() => {
        const animationPlayed = sessionStorage.getItem('homeAnimationPlayed');
        if (!animationPlayed) {
            setShowIntroAnimation(true);
            sessionStorage.setItem('homeAnimationPlayed', 'true');
        } else {
            setIsFlameVisible(true);
            // Skip typing animation if intro was already played
            setH1Text(H1_FULL_TEXT);
            setP1Text(P1_FULL_TEXT);
            setP2Text(P2_FULL_TEXT);
            setTypingStep(4); // Mark as done
        }
    }, []);

    useEffect(() => {
        if (igniteFlame) {
            const timer = setTimeout(() => {
                setIgniteFlame(false); // Remove class after it plays
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [igniteFlame]);

    const handleAnimationComplete = () => {
        setShowIntroAnimation(false);
        setIsFlameVisible(true);
        setIgniteFlame(true);
        // Start typing after flame ignites
        setTimeout(() => {
            setTypingStep(1);
        }, 700);
    };
    
    useEffect(() => {
        if (typingStep === 0 || typingStep > 3) return;

        let targetText: string;
        let setText: React.Dispatch<React.SetStateAction<string>>;

        if (typingStep === 1) {
            targetText = H1_FULL_TEXT;
            setText = setH1Text;
        } else if (typingStep === 2) {
            targetText = P1_FULL_TEXT;
            setText = setP1Text;
        } else { // typingStep === 3
            targetText = P2_FULL_TEXT;
            setText = setP2Text;
        }

        let i = 0;
        const intervalId = setInterval(() => {
            setText(targetText.substring(0, i + 1));
            i++;
            if (i >= targetText.length) {
                clearInterval(intervalId);
                setTimeout(() => {
                    setTypingStep(s => s + 1);
                }, 500);
            }
        }, TYPING_SPEED);

        return () => clearInterval(intervalId);

    }, [typingStep]);
    
    useEffect(() => {
        if (typingStep === 4) {
            onAnimationComplete();
        }
    }, [typingStep, onAnimationComplete]);


    return (
        <div className="flex-1 flex flex-col items-center justify-between p-4 text-center animate-fade-in relative">
            <div className="mb-8">
                {showIntroAnimation && <LoadingAnimation onComplete={handleAnimationComplete} />}
                
                <div className="relative w-56 h-56 mb-6">
                    {isFlameVisible && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
                            <div className="w-96 h-48 transform scale-[1.75] -rotate-15 -translate-x-6 flame-light-effect">
                                <LogoIcon />
                            </div>
                        </div>
                    )}
                    <div
                        className={`w-full h-full transition-opacity duration-300 relative
                            ${isFlameVisible ? 'opacity-100' : 'opacity-0'}
                            ${igniteFlame ? 'animate-flame-ignite-flash' : ''}
                            ${!showIntroAnimation && !igniteFlame ? 'animate-breathing' : ''}`
                        }
                    >
                        <NexusOrb />
                    </div>
                    {isFlameVisible && <Embers />}
                </div>

                <div className={`transition-opacity duration-500 ${typingStep > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white h-[1.2em]">
                        <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">{h1Text.substring(0, 5)}</span>
                        <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">{h1Text.substring(5)}</span>
                        {typingStep === 1 && <span className="blinking-cursor"></span>}
                    </h1>
                    <p className="text-xl sm:text-2xl font-semibold text-white mt-4 h-[1.2em]">
                        {p1Text}
                        {typingStep === 2 && <span className="blinking-cursor"></span>}
                    </p>
                    <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-2 max-w-md h-[1.5em]">
                        {p2Text}
                        {typingStep === 3 && <span className="blinking-cursor"></span>}
                    </p>
                </div>
            </div>

            <div className={`w-full max-w-md ${typingStep === 4 ? 'animate-slide-up-fade-in' : 'opacity-0'}`}>
                <ModeTiles onSelectMode={onSelectMode} />
            </div>
        </div>
    );
};