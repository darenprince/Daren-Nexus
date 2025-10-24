import React, { useState, useEffect } from 'react';
import { LogoIcon } from './LogoIcon';
import { Embers } from './Embers';
import { StarryBackground } from './StarryBackground';

interface AuthScreenProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onGuest: () => Promise<void>;
  onForgotPassword: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuest, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [startLogoAnimation, setStartLogoAnimation] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartLogoAnimation(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isAnyLoading = isLoginLoading || isGuestLoading;
  const isLoginButtonDisabled = isAnyLoading || !email.trim() || !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginButtonDisabled) {
      setIsLoginLoading(true);
      setError('');
      setTimeout(() => {
        onLogin(email.trim(), password, rememberMe)
          .catch((err) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
            setIsLoginLoading(false);
          });
      }, 2000);
    }
  };

  const handleGuest = async () => {
    setIsGuestLoading(true);
    setError('');
    setTimeout(() => {
        onGuest()
          .catch((err) => {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('An unknown error occurred while starting a guest session.');
            }
            setIsGuestLoading(false);
          });
    }, 2000);
  };

  return (
    <div className="min-h-full w-full max-w-md mx-auto flex flex-col items-center justify-center p-10 text-center">
      <StarryBackground />
      <div className={`relative w-48 h-24 logo-container -translate-x-3 ${startLogoAnimation ? 'animate' : ''}`}>
        <div className="w-full h-full animate-fade-in" style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="logo-glow w-full h-full">
                <LogoIcon />
            </div>
        </div>
        {startLogoAnimation && <Embers />}
      </div>

      <p className="text-xl text-white mt-6">
         <span className="text-gray-400">No filter.</span> <strong className="font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">No bullshit.</strong>
      </p>

      <form onSubmit={handleSubmit} className="w-full mt-12">
        <div className="space-y-4">
            <div className={`relative rounded-full ${isEmailFocused ? 'input-chase-glow' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="Enter your email"
                  disabled={isAnyLoading}
                  autoComplete="email"
                  className="relative z-10 w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-transparent focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
                />
            </div>
            <div className={`relative rounded-full ${isPasswordFocused ? 'input-chase-glow' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="Enter password"
                  disabled={isAnyLoading}
                  autoComplete="current-password"
                  className="relative z-10 w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-transparent focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
                />
            </div>
        </div>

        <div className="mt-4 px-2 flex justify-between items-center">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
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
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-gray-500 hover:text-nexusPurple-400 transition-colors"
            >
              Forgot Password?
            </button>
        </div>

        {error && <p className="text-red-400 mt-3 text-sm text-left">{error}</p>}
        <button
          type="submit"
          disabled={isLoginButtonDisabled}
          className={`auth-plug-in-button btn-radiate-glow w-full text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mt-4 relative overflow-hidden
            disabled:cursor-not-allowed disabled:filter disabled:saturate-50 disabled:brightness-75
            ${!isLoginButtonDisabled ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90' : 'bg-nexusPurple-800' }
            ${isLoginLoading ? 'is-loading bg-gradient-to-r from-orange-600 to-red-700' : ''}
          `}
        >
          <span className="relative z-10 flex items-center justify-center h-6">
            {isLoginLoading ? (
                <div className="flex space-x-1.5 justify-center items-center">
                    <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white" style={{ animationDelay: '0.4s' }}></div>
                </div>
            ) : (
                <span>Plug In <span className="font-normal opacity-70">or</span> Sign Up</span>
            )}
          </span>
        </button>
      </form>

      <div className="my-6 flex items-center w-full">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <button
        onClick={handleGuest}
        disabled={isAnyLoading}
        className="btn-radiate-glow w-full bg-transparent border border-white/20 text-gray-400 font-bold py-3 px-6 rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200 disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center h-6">
            {isGuestLoading ? (
                <div className="flex space-x-1.5 justify-center items-center">
                    <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-dot-bounce rounded-full bg-white" style={{ animationDelay: '0.4s' }}></div>
                </div>
            ) : <span className="text-gray-500">Go Off the Record</span>}
        </span>
      </button>
    </div>
  );
};