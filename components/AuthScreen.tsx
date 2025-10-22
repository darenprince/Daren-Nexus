import React, { useState, useEffect } from 'react';
import { LogoIcon } from './LogoIcon';
import { Embers } from './Embers';
import { StarryBackground } from './StarryBackground';

interface AuthScreenProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  onGuest: () => Promise<void>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuest }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [startLogoAnimation, setStartLogoAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartLogoAnimation(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isButtonDisabled = isLoading || !username.trim() || !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonDisabled) {
      setIsLoading(true);
      setError('');
      try {
        await onLogin(username.trim(), password, rememberMe);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
        setIsLoading(false);
      }
    }
  };

  const handleGuest = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onGuest();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while starting a guest session.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full max-w-md mx-auto flex flex-col items-center justify-center p-10 text-center animate-fade-in">
      <StarryBackground />
      <div className={`relative w-48 h-24 logo-container -translate-x-1 ${startLogoAnimation ? 'animate' : ''}`}>
        <div className="w-full h-full animate-fade-in" style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="logo-glow w-full h-full">
                <LogoIcon />
            </div>
        </div>
        {startLogoAnimation && <Embers />}
      </div>

      <p className="text-xl text-white mt-6">
         No filter. <strong className="font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">No bullshit</strong>
      </p>

      <form onSubmit={handleSubmit} className="w-full mt-12">
        <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              autoComplete="username"
              className="w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-nexusPurple-500 focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
              className="w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-nexusPurple-500 focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
            />
        </div>

        <div className="mt-4 ml-2">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer w-max">
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center peer-checked:border-nexusPurple-500 transition-colors">
                    <div className={`w-2 h-2 rounded-full transition-colors ${rememberMe ? 'bg-nexusPurple-500' : 'bg-transparent'}`}></div>
                </div>
                <span className="text-sm">Save login info</span>
            </label>
        </div>

        {error && <p className="text-red-400 mt-3 text-sm text-left">{error}</p>}
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-full text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mt-4
            ${isButtonDisabled
              ? 'bg-nexusPurple-800 opacity-70 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90'
            }`}
        >
          {isLoading ? 'Syncing...' : 'Plug In'}
        </button>
      </form>

      <div className="my-6 flex items-center w-full">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <button
        onClick={handleGuest}
        disabled={isLoading}
        className="w-full bg-transparent border border-white/20 text-white font-bold py-3 px-6 rounded-full hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
      >
        Go Off the Record
      </button>
    </div>
  );
};