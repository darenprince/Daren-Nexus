import React from 'react';

interface AgeGatingModalProps {
    onAgree: () => void;
}

export const AgeGatingModal: React.FC<AgeGatingModalProps> = ({ onAgree }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div 
                className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in transition-colors duration-500"
            >
                <h2 className="text-2xl font-bold text-white mb-4">
                    Explicit Content Warning
                </h2>
                <div className="text-slate-300 text-lg space-y-4">
                    <p>
                        This is The Daren Nexus. The conversations here are unfiltered and intended for a mature audience (18+).
                    </p>
                    <p>
                        Expect <strong className="text-white">explicit language</strong>, <strong className="text-white">adult themes</strong>, and raw, unapologetic honesty. If you're not ready for that, this isn't the place for you.
                    </p>
                </div>
                <button
                    onClick={onAgree}
                    className="w-full mt-8 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full transition-opacity hover:opacity-90 text-lg"
                >
                    I'm Over 18 & I Get It
                </button>
                <a
                    href="https://www.google.com"
                    className="inline-block w-full mt-4 bg-transparent border border-white/20 text-white/60 font-bold py-3 px-6 rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200 text-lg"
                >
                    Return to Safety
                </a>
            </div>
        </div>
    );
};