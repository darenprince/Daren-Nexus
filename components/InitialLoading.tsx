import React from 'react';
import { NexusOrb } from './NexusOrb';

export const InitialLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-main-gradient flex flex-col items-center justify-center z-50 p-8 text-center animate-fade-in">
      <div className="w-24 h-24 mb-6 animate-subtle-pulse">
        <NexusOrb />
      </div>
      <h1 className="text-xl font-medium tracking-tight text-white">
        Connecting to the Nexus...
      </h1>
    </div>
  );
};