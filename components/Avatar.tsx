import React from 'react';

interface AvatarProps {
  name: string;
}

// FIX: Export the Avatar component so it can be used in other files.
export const Avatar: React.FC<AvatarProps> = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  // Simple hash function to get a color index from the name
  const getColorIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500'
  ];

  const colorClass = colors[getColorIndex(name) % colors.length];

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
      <span className="text-xl font-bold text-white">{initial}</span>
    </div>
  );
};