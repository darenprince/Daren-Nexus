import React from 'react';
import { NexusOrb } from './NexusOrb';

export const InitialLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-main-gradient flex flex-col items-center justify-center z-[100] p-8 text-center animate-fade-in">
      <div className="w-24 h-24 animate-subtle-pulse">
        <NexusOrb />
      </div>
    </div>
  );
};