import React from 'react';

export const HamburgerIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="18" cy="18" r="17.5" fill="var(--card-bg)" stroke="rgba(255, 255, 255, 0.05)"/>
    <g stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M10 15H26" />
        <path d="M10 22H26" />
    </g>
  </svg>
);