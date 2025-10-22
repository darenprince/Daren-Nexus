import React from 'react';

// This component renders multiple SVG lines that are animated via CSS
// The keyframes 'spark-fly-out' should be defined in index.html
export const Sparks: React.FC = () => (
    <svg viewBox="0 0 100 100" className="absolute w-48 h-48 pointer-events-none">
        <line x1="50" y1="50" x2="70" y2="20" className="spark" style={{ animationDelay: '0s' }} />
        <line x1="50" y1="50" x2="80" y2="60" className="spark" style={{ animationDelay: '0.1s' }} />
        <line x1="50" y1="50" x2="40" y2="80" className="spark" style={{ animationDelay: '0.2s' }} />
        <line x1="50" y1="50" x2="20" y2="35" className="spark" style={{ animationDelay: '0.3s' }} />
        <line x1="50" y1="50" x2="45" y2="15" className="spark" style={{ animationDelay: '0.4s' }} />
        <line x1="50" y1="50" x2="85" y2="50" className="spark" style={{ animationDelay: '0.5s' }} />
    </svg>
);