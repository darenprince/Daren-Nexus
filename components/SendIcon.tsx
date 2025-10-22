import React from 'react';

interface SendIconProps {
  disabled: boolean;
}

export const SendIcon: React.FC<SendIconProps> = ({ disabled }) => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="send-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    <path
      d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
      stroke={disabled ? "currentColor" : "url(#send-icon-gradient)"}
      className={`transition-colors ${disabled ? 'text-gray-500' : ''}`}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
