import React, { useEffect, useState } from 'react';

interface FieryTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export const FieryTransition: React.FC<FieryTransitionProps> = ({ isActive, onComplete }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
    }
  }, [isActive]);

  const handleAnimationEnd = () => {
    onComplete();
    // After animation, we can unmount the component
    setShouldRender(false);
  };
  
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes fire-wipe {
          0% { transform: translateY(100%); }
          50% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
        @keyframes fire-flicker-transition {
          0% { transform: scale(1) skewX(0); opacity: 0.8; }
          25% { transform: scale(1.1) skewX(5deg); opacity: 1; }
          50% { transform: scale(0.9) skewX(-5deg); opacity: 0.9; }
          75% { transform: scale(1.05) skewX(2deg); opacity: 1; }
          100% { transform: scale(1) skewX(0); opacity: 0.8; }
        }
        .fire-transition-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          pointer-events: none;
          background: transparent;
          overflow: hidden;
          animation: fire-wipe 1.2s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards;
        }
        .fire-transition-particle-container {
            position: absolute;
            inset: 0;
            filter: blur(8px) contrast(2);
        }
        .fire-transition-particle {
            position: absolute;
            bottom: -50px;
            width: 10vw;
            height: 20vh;
            background: radial-gradient(circle, #fef08a 0%, #f97316 40%, #dc2626 70%, transparent 80%);
            border-radius: 50%;
            animation-name: fire-flicker-transition;
            animation-iteration-count: infinite;
        }
      `}</style>
      <div 
        className="fire-transition-overlay"
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="fire-transition-particle-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="fire-transition-particle"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDuration: `${Math.random() * 0.5 + 0.3}s`,
                animationDelay: `${Math.random() * 0.2}s`,
                transform: `scale(${Math.random() * 0.5 + 0.8})`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
