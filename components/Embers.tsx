import React from 'react';

export const Embers: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="ember-particle" style={{ top: '80%', left: '50%', animationDelay: '0s', animationDuration: '4s' }} />
    <div className="ember-particle" style={{ top: '85%', left: '45%', animationDelay: '1.5s', animationDuration: '5s' }} />
    <div className="ember-particle" style={{ top: '75%', left: '55%', animationDelay: '3s', animationDuration: '3.5s' }} />
    <div className="ember-particle" style={{ top: '90%', left: '60%', animationDelay: '0.5s', animationDuration: '6s' }} />
    <div className="ember-particle" style={{ top: '88%', left: '40%', animationDelay: '2.5s', animationDuration: '4.5s' }} />
    <div className="ember-particle" style={{ top: '82%', left: '48%', animationDelay: '4s', animationDuration: '5.5s' }} />
  </div>
);
