import React from 'react';

interface NexusOrbProps {
  mood?: 'idle' | 'thinking' | 'listening';
}

export const NexusOrb: React.FC<NexusOrbProps> = ({ mood = 'idle' }) => {
  return (
    <div className={`w-full h-full relative nexus-flame-container mood-${mood}`}>
      <style>{`
        .nexus-flame-container {
          transform-style: preserve-3d;
        }

        /* --- Animations --- */
        @keyframes flicker-1 {
          0%, 100% { transform: scaleY(1) skewX(0); opacity: 1; }
          50% { transform: scaleY(1.05) skewX(5deg); opacity: 0.95; }
        }
        @keyframes flicker-2 {
          0%, 100% { transform: scaleY(1) skewX(0); opacity: 1; }
          50% { transform: scaleY(1.08) skewX(-5deg); opacity: 0.9; }
        }
        @keyframes flicker-3 {
          0%, 100% { transform: scaleY(1) skewX(0); opacity: 0.7; }
          50% { transform: scaleY(1.02) skewX(2deg); opacity: 0.6; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes rise {
          from { transform: translateY(0) scale(1); opacity: 0.7; }
          to { transform: translateY(-60px) scale(0.5); opacity: 0; }
        }

        /* --- Base Animations --- */
        .flame-1 { animation: flicker-1 1.5s ease-in-out infinite; }
        .flame-2 { animation: flicker-2 1.5s 0.2s ease-in-out infinite; }
        .flame-3 { animation: flicker-3 1.5s 0.1s ease-in-out infinite; }

        .ember { animation-name: rise; animation-timing-function: linear; animation-iteration-count: infinite; }
        .ember-1 { animation-duration: 4s; animation-delay: 0s; }
        .ember-2 { animation-duration: 5s; animation-delay: 1s; }
        .ember-3 { animation-duration: 3s; animation-delay: 2s; }
        .ember-4 { animation-duration: 4.5s; animation-delay: 2.5s; }
        .ember-5 { animation-duration: 6s; animation-delay: 3s; }

        /* --- Mood-based Overrides --- */
        .mood-thinking .flame-part {
            animation-duration: 0.5s;
        }
        .mood-listening .flame-group {
            animation: pulse 2s ease-in-out infinite;
        }

      `}</style>
      
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="grad-flame-1" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="grad-flame-2" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="80%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#762DD4" stopOpacity="0.1" />
          </radialGradient>
           <radialGradient id="grad-flame-3" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#762DD4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#762DD4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="grad-ember">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </radialGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          </filter>
        </defs>

        {/* Wrapper: Embers */}
        <g className="embers">
            <circle className="ember ember-1" cx="55" cy="80" r="1.5" fill="url(#grad-ember)" />
            <circle className="ember ember-2" cx="40" cy="85" r="1" fill="url(#grad-ember)" />
            <circle className="ember ember-3" cx="65" cy="82" r="1" fill="url(#grad-ember)" />
            <circle className="ember ember-4" cx="35" cy="90" r="1.2" fill="url(#grad-ember)" />
            <circle className="ember ember-5" cx="70" cy="88" r="0.8" fill="url(#grad-ember)" />
        </g>
        
        {/* Flame */}
        <g className="flame-group" style={{transformOrigin: '50% 90%'}}>
            <g filter="url(#glow)">
                <path 
                    className="flame-part flame-3" 
                    d="M50 100 C 30 80, 25 40, 50 15 C 75 40, 70 80, 50 100 Z"
                    fill="url(#grad-flame-3)"
                    style={{transformOrigin: '50% 90%', transform: 'scale(1.3)'}}
                />
                 <path 
                    className="flame-part flame-2" 
                    d="M50 100 C 35 80, 30 50, 50 20 C 70 50, 65 80, 50 100 Z"
                    fill="url(#grad-flame-2)"
                    style={{transformOrigin: '50% 90%'}}
                />
                 <path 
                    className="flame-part flame-1" 
                    d="M50 95 C 40 80, 42 60, 50 35 C 58 60, 60 80, 50 95 Z"
                    fill="url(#grad-flame-1)"
                    style={{transformOrigin: '50% 90%'}}
                />
            </g>
        </g>
      </svg>
    </div>
  );
};