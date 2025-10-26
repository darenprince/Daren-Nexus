import React, { useState, useEffect } from 'react';
import { LogoIcon } from './LogoIcon';
import { Embers } from './Embers';
import { StarryBackground } from './StarryBackground';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGuest: () => Promise<void>;
  onForgotPassword: () => void;
  onSignInWithPhone: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  onVerifyPhoneNumber: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  onSetUpRecaptcha: (containerId: string) => RecaptchaVerifier;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuest, onForgotPassword, onSignInWithPhone, onVerifyPhoneNumber, onSetUpRecaptcha }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneSignIn, setIsPhoneSignIn] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [error, setError] = useState('');
  const [startLogoAnimation, setStartLogoAnimation] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [appVerifier, setAppVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const verifier = onSetUpRecaptcha('recaptcha-container');
    setAppVerifier(verifier);
  }, [onSetUpRecaptcha]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartLogoAnimation(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isAnyLoading = isLoginLoading || isGuestLoading || isPhoneLoading;
  const isLoginButtonDisabled = isAnyLoading || !email.trim() || !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginButtonDisabled) {
      setIsLoginLoading(true);
      setError('');
      try {
        await onLogin(email.trim(), password);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setIsLoginLoading(false);
      }
    }
  };

  const handleGuest = async () => {
    setIsGuestLoading(true);
    setError('');
    try {
      await onGuest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while starting a guest session.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (appVerifier) {
      setIsPhoneLoading(true);
      setError('');
      try {
        const confirmation = await onSignInWithPhone(phone, appVerifier);
        setConfirmationResult(confirmation);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsPhoneLoading(false);
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationResult) {
      setIsPhoneLoading(true);
      setError('');
      try {
        await onVerifyPhoneNumber(confirmationResult, verificationCode);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsPhoneLoading(false);
      }
    }
  };

  return (
    <div className="min-h-full w-full max-w-md mx-auto flex flex-col items-center justify-center p-10 text-center">
      <div id="recaptcha-container"></div>
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

      {isPhoneSignIn ? (
        confirmationResult ? (
          <form onSubmit={handleVerifyCode} className="w-full mt-12">
            <div className="space-y-4">
              <div className={`relative rounded-full`}>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  disabled={isAnyLoading}
                  className="relative z-10 w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-transparent focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAnyLoading}
              className={`auth-plug-in-button btn-radiate-glow w-full text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mt-4 relative overflow-hidden`}
            >
              Verify
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneSignIn} className="w-full mt-12">
            <div className="space-y-4">
              <div className={`relative rounded-full`}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isAnyLoading}
                  className="relative z-10 w-full bg-[#0A0A0B] text-white placeholder:text-gray-500 border-2 border-white/10 focus:border-transparent focus:ring-0 rounded-full px-5 py-3 text-lg transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAnyLoading}
              className={`auth-plug-in-button btn-radiate-glow w-full text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mt-4 relative overflow-hidden`}
            >
              Send Code
            </button>
          </form>
        )
      ) : (
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

          <div className="mt-4 px-2 flex justify-end items-center">
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
      )}

      <div className="my-6 flex items-center w-full">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <button
        onClick={() => setIsPhoneSignIn(!isPhoneSignIn)}
        disabled={isAnyLoading}
        className="btn-radiate-glow w-full bg-transparent border border-white/20 text-gray-400 font-bold py-3 px-6 rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200 disabled:opacity-50"
      >
        {isPhoneSignIn ? 'Sign in with Email' : 'Sign in with Phone'}
      </button>

      <button
        onClick={handleGuest}
        disabled={isAnyLoading}
        className="btn-radiate-glow w-full bg-transparent border border-white/20 text-gray-400 font-bold py-3 px-6 rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200 disabled:opacity-50 mt-4"
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