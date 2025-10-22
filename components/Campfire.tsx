import React from 'react';

export const Campfire: React.FC = () => (
    <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <style>{`
            .flame { animation: flicker 1.2s ease-in-out infinite; transform-origin: 50% 100%; }
            .flame.f2 { animation-delay: 0.3s; }
            .flame.f3 { animation-delay: 0.6s; }
            .ember { animation-timing-function: ease-out; animation-iteration-count: infinite; transform-origin: 50% 100%; }
            .ember.e1 { animation-name: ember-rise-1; animation-duration: 3s; animation-delay: 0s; }
            .ember.e2 { animation-name: ember-rise-2; animation-duration: 2.5s; animation-delay: 0.5s; }
            .ember.e3 { animation-name: ember-rise-3; animation-duration: 4s; animation-delay: 1.2s; }
            .ember.e4 { animation-name: ember-rise-2; animation-duration: 3.5s; animation-delay: 1.8s; }
            .ember.e5 { animation-name: ember-rise-1; animation-duration: 2.8s; animation-delay: 2.2s; }
            .ember.e6 { animation-name: ember-rise-3; animation-duration: 3.2s; animation-delay: 2.5s; }
            .smoke { animation: smoke-rise 4s ease-out infinite; transform-origin: 50% 100%; }
            .smoke.s2 { animation-delay: 1.5s; animation-duration: 5s; }
            .smoke.s3 { animation-delay: 2.5s; animation-duration: 3.5s; }

            @keyframes flicker {
                0%, 100% { transform: scaleY(1) skewX(0); opacity: 1; }
                50% { transform: scaleY(1.2) skewX(4deg); opacity: 0.8; }
            }
            @keyframes ember-rise-1 {
                from { transform: translateY(0) scale(1); opacity: 0.9; }
                to { transform: translateY(-40px) translateX(15px) scale(0); opacity: 0; }
            }
            @keyframes ember-rise-2 {
                from { transform: translateY(0) scale(1); opacity: 0.9; }
                to { transform: translateY(-35px) translateX(-15px) scale(0); opacity: 0; }
            }
            @keyframes ember-rise-3 {
                from { transform: translateY(0) scale(1); opacity: 0.8; }
                to { transform: translateY(-45px) translateX(5px) scale(0); opacity: 0; }
            }
            @keyframes smoke-rise {
                from { transform: translateY(0) scale(1) translateX(0); opacity: 0.3; }
                to { transform: translateY(-30px) scale(2.5) translateX(10px); opacity: 0; }
            }
        `}</style>
        <defs>
            <radialGradient id="fireGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="70%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.5" />
            </radialGradient>
            <linearGradient id="smokeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            </filter>
        </defs>

        {/* Logs */}
        <g fill="#42281a">
            <rect x="25" y="42" width="50" height="6" rx="3" transform="rotate(-10 50 45)" />
            <rect x="25" y="40" width="50" height="6" rx="3" transform="rotate(10 50 45)" />
        </g>

        {/* Smoke */}
        <g fill="url(#smokeGrad)">
             <path className="smoke s1" d="M45 40 Q 50 30, 55 40 T 65 40" stroke="none" />
             <path className="smoke s2" d="M40 42 Q 45 35, 50 42 T 60 42" stroke="none" />
             <path className="smoke s3" d="M50 38 Q 55 32, 60 38 T 70 38" stroke="none" />
        </g>

        {/* Flames */}
        <g filter="url(#glow)">
            <path className="flame f1" d="M50 42 C 40 30, 45 15, 50 10 C 55 15, 60 30, 50 42 Z" fill="url(#fireGrad)" />
            <path className="flame f2" d="M45 42 C 40 35, 42 25, 45 20 C 48 25, 50 35, 45 42 Z" fill="url(#fireGrad)" opacity="0.8" transform="scale(0.8)" transform-origin="50 45" />
            <path className="flame f3" d="M55 42 C 50 35, 52 25, 55 20 C 58 25, 60 35, 55 42 Z" fill="url(#fireGrad)" opacity="0.8" transform="scale(0.9)" transform-origin="50 45" />
        </g>

        {/* Embers */}
        <g fill="#FBBF24">
            <circle className="ember e1" cx="50" cy="35" r="1.2" />
            <circle className="ember e2" cx="47" cy="30" r="0.8" />
            <circle className="ember e3" cx="53" cy="32" r="1" />
            <circle className="ember e4" cx="45" cy="38" r="0.7" />
            <circle className="ember e5" cx="55" cy="36" r="0.9" />
            <circle className="ember e6" cx="48" cy="28" r="0.6" />
        </g>
    </svg>
);