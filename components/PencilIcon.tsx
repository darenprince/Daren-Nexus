import React from 'react';

export const PencilIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2}
    >
        <defs>
            <linearGradient id="pencil-icon-gradient-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" /> 
                <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
        </defs>
        <path 
            stroke="url(#pencil-icon-gradient-purple)"
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
        />
    </svg>
);