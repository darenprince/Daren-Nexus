import React, { useState, useEffect } from 'react';
import { NexusOrb } from './NexusOrb';

interface IntroProps {
  onIntroComplete: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onIntroComplete }) => {
  const [animationClass, setAnimationClass] = useState('animate-fade-in');

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setAnimationClass('animate-fade-out');
    }, 2000);

    const completeTimer = setTimeout(() => {
      onIntroComplete();
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onIntroComplete]);

  return (
    <div className={`fixed inset-0 bg-main-gradient flex flex-col items-center justify-center z-50 p-8 text-center transition-opacity duration-500 ${animationClass}`}>
      <div className="w-24 h-24 mb-6">
        <NexusOrb />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        The Daren Nexus
      </h1>
      <p className="text-lg text-white mt-2">
        No filter. <strong className="font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">No bullshit.</strong>
      </p>
    </div>
  );
};