import React from 'react';

interface FlameIconProps {
  isOnFire: boolean;
}

export const FlameIcon: React.FC<FlameIconProps> = ({ isOnFire }) => {
  if (isOnFire) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="flame-flicker" style={{ transformOrigin: 'bottom center' }}>
          <path d="M12 2C9.25 7 6 9.25 6 13.5C6 17.09 8.69 20 12 20s6-2.91 6-6.5C18 9.25 14.75 7 12 2Z" fill="url(#flame-gradient-1)" />
          <path d="M12 6C10.5 9 9 10.5 9 13.5C9 15.985 10.343 18 12 18s3-2.015 3-4.5C15 10.5 13.5 9 12 6Z" fill="url(#flame-gradient-2)" opacity="0.8" />
        </g>
        <defs>
          <radialGradient id="flame-gradient-1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#762DD4" />
          </radialGradient>
          <radialGradient id="flame-gradient-2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" />
          </radialGradient>
        </defs>
         <style>{`
          @keyframes flicker {
            0%, 100% { transform: scaleY(1) skewX(0); }
            50% { transform: scaleY(1.05) skewX(2deg); }
          }
          .flame-flicker {
            animation: flicker 0.5s ease-in-out infinite;
          }
        `}</style>
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C9.25 7 6 9.25 6 13.5C6 17.09 8.69 20 12 20s6-2.91 6-6.5C18 9.25 14.75 7 12 2Z" fill="currentColor" className="text-gray-400" />
    </svg>
  );
};