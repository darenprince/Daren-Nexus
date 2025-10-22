import React from 'react';

interface StarryBackgroundProps {
  starCount?: number;
}

export const StarryBackground: React.FC<StarryBackgroundProps> = ({ starCount = 50 }) => {
    const stars = Array.from({ length: starCount }).map((_, i) => {
        const duration = Math.random() * 2 + 1; // 1s to 3s twinkle
        const delay = Math.random() * 2; // 0 to 2s delay
        const top = Math.random() * 25; // Constrain stars to the top 25% of the screen
        const left = Math.random() * 100;
        const size = Math.random() * 1.5 + 0.5; // 0.5px to 2px

        const style = {
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `twinkle ${duration}s ease-in-out ${delay}s 1s`,
        };

        return (
            <div
                key={`star-${i}`}
                className="star-particle"
                style={style as React.CSSProperties}
            />
        );
    });

    return (
        <div 
            className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none"
        >
            {stars}
        </div>
    );
};