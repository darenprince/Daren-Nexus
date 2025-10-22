import React, { useState, useEffect } from 'react';
import { Sparks } from './Sparks';

interface LoadingAnimationProps {
    onComplete: () => void;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0: lets, 1: get, 2: lit
    const [showSparks, setShowSparks] = useState(false);
    const [visible, setVisible] = useState(true);

    const words = ['lets', 'get', 'lit'];
    const currentWord = words[step];

    useEffect(() => {
        // This class is crucial for the "LIT" animation to not be clipped.
        document.body.classList.add('loading-animation-active');
        // Cleanup function to remove the class when the component unmounts
        return () => {
            document.body.classList.remove('loading-animation-active');
        };
    }, []); // Runs only once on mount

    useEffect(() => {
        if (step > 2) {
            // Word animation is done, now handle sparks and completion
            setShowSparks(true);
            const sparkTimer = setTimeout(() => {
                setVisible(false); // Fade out the whole container
            }, 600); // Duration of spark animation
            const completeTimer = setTimeout(() => {
                onComplete();
            }, 1100); // spark duration + fade out duration (500ms)

            return () => {
                clearTimeout(sparkTimer);
                clearTimeout(completeTimer);
            };
        }

        const duration = step === 2 ? 2000 : 800; // 'lit' animation lasts 2s

        const timer = setTimeout(() => {
            setStep(s => s + 1);
        }, duration);

        return () => clearTimeout(timer);
    }, [step, onComplete]);

    let animationClass = '';
    if (step === 0 || step === 1) {
        animationClass = 'animate-word-fade';
    } else if (step === 2) {
        animationClass = 'animate-lit-glow-and-fade';
    }

    return (
        <div className={`absolute top-[12vh] left-0 right-0 flex flex-col items-center justify-center z-20 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {showSparks && <Sparks />}
            
            {step <= 2 && (
                <span
                    key={currentWord}
                    className={`text-8xl md:text-9xl font-black text-white uppercase tracking-widest ${animationClass}`}
                    style={{ textShadow: '0 0 15px rgba(249, 115, 22, 0.7)' }}
                >
                    {currentWord}
                </span>
            )}
        </div>
    );
};
