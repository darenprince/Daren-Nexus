import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { hasAttemptedNexusAndChill, recordNexusAndChillAttempt } from '../services/persistenceService';
import { CloseIcon } from './CloseIcon';

interface NexusAndChillModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}

type Step = 'checking' | 'intro' | 'questions' | 'result' | 'alreadyUsed' | 'declined';
type Answers = { [key: string]: string };
type Result = {
    finalStatus: 'PASS' | 'FAIL';
    score: number;
    narrative: string;
    reasons: string[];
    safetyFlags: string[];
};

const questions = [
    { id: 'q1', text: 'Any active pest infestation at home?', options: ['Yes', 'No'] },
    { id: 'q2', text: 'Currently in a relationship or married and not transparent about it?', options: ['Yes', 'No'] },
    { id: 'q3', text: 'Is there anyone who would threaten, show up uninvited, or cause physical danger if you had a guest?', options: ['Yes', 'No'] },
    { id: 'q4', text: 'STI/HIV status?', options: ['No', 'Treated or managed', 'Unsure'] },
    { id: 'q5', text: 'Sober and able to give and withdraw consent clearly?', options: ['Yes', 'No'] },
    { id: 'q6', text: 'Comfortable signing a simple NDA and keeping this private?', options: ['Yes', 'No'] },
];

export const NexusAndChillModal: React.FC<NexusAndChillModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [step, setStep] = useState<Step>('checking');
    const [answers, setAnswers] = useState<Answers>({});
    const [result, setResult] = useState<Result | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const checkAttempt = async () => {
            if (isOpen) {
                const hasAttempted = await hasAttemptedNexusAndChill(currentUser.hash);
                setStep(hasAttempted ? 'alreadyUsed' : 'intro');
                if (closeButtonRef.current) {
                    closeButtonRef.current.focus();
                }
            }
        };
        checkAttempt();
    }, [isOpen, currentUser.hash]);
    
    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleStart = () => {
        recordNexusAndChillAttempt(currentUser.hash); // Record attempt as soon as they start
        setStep('questions');
    };
    
    const calculateResult = (): Result => {
        let score = 100;
        const reasons: string[] = [];
        const safetyFlags: string[] = [];
        let finalStatus: 'PASS' | 'FAIL' = 'PASS';

        // Immediate fail conditions
        if (answers.q1 === 'Yes') { finalStatus = 'FAIL'; reasons.push('Q1 Fail: Active pest infestation.'); }
        if (answers.q3 === 'Yes') { finalStatus = 'FAIL'; reasons.push('Q3 Fail: Physical danger risk.'); safetyFlags.push('SAFETY RISK: Potential for physical danger from a third party.'); }
        if (answers.q2 === 'Yes') { finalStatus = 'FAIL'; reasons.push('Q2 Fail: Lack of transparency in existing relationship.'); }
        if (answers.q5 === 'No') { finalStatus = 'FAIL'; reasons.push('Q5 Fail: Unable to give clear consent.'); safetyFlags.push('SAFETY RISK: Consent capability compromised.'); }
        if (answers.q4 === 'Unsure') { finalStatus = 'FAIL'; reasons.push('Q4 Fail: Unsure STI/HIV status.'); }
        
        if (finalStatus === 'FAIL') {
            return { finalStatus, score: 0, reasons, safetyFlags, narrative: "Looks okay on surface." };
        }

        // Point deductions
        if (answers.q4 === 'Treated or managed') { score -= 20; reasons.push('Q4 Deduction (-20): Treated/managed STI status.'); }
        if (answers.q6 === 'No') { score -= 30; reasons.push('Q6 Deduction (-30): Unwillingness to sign NDA.'); }

        // Final numeric check
        if (score < 60) {
            finalStatus = 'FAIL';
            reasons.push(`Score Fail: Final score (${score}) is below threshold (60).`);
        }
        
        const narrative = finalStatus === 'PASS' ? "Clean enough and honest enough to visit." : "Looks okay on surface.";

        return { finalStatus, score, reasons, safetyFlags, narrative };
    };

    const generateAndSendAudit = (calcResult: Result) => {
        const audit = `
NEXUS & CHILL AUDIT REPORT
----------------------------------
Respondent ID: ${currentUser.hash}
Email: ${currentUser.email}
Timestamp: ${new Date().toISOString()}
----------------------------------
ANSWERS:
Q1 (Pests): ${answers.q1 || 'N/A'}
Q2 (Relationship): ${answers.q2 || 'N/A'}
Q3 (Danger): ${answers.q3 || 'N/A'}
Q4 (STI/HIV): ${answers.q4 || 'N/A'}
Q5 (Consent): ${answers.q5 || 'N/A'}
Q6 (NDA): ${answers.q6 || 'N/A'}
----------------------------------
FINAL DECISION:
Score: ${calcResult.score}
Status: ${calcResult.finalStatus}
Card Presented to User: "${calcResult.finalStatus === 'PASS' ? 'PASS' : 'Pass'}"
----------------------------------
REASONS:
${calcResult.reasons.join('\n') || 'N/A'}
----------------------------------
SAFETY FLAGS:
${calcResult.safetyFlags.join('\n') || 'None'}
----------------------------------
RETENTION NOTE: Raw data purged in 30 days.
        `;
        console.log("--- AUDIT FOR DAREN (SIMULATED EMAIL) ---", audit);
        const mailtoLink = `mailto:daren.prince@gmail.com?subject=Nexus & Chill Audit: ${currentUser.email}&body=${encodeURIComponent(audit)}`;
        // In a real app, you'd post this to a server. Here, we can open a mailto link or just log it.
        // window.open(mailtoLink);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const calcResult = calculateResult();
        setResult(calcResult);
        generateAndSendAudit(calcResult);
        setStep('result');
    };

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <>
                        <h2 id="nexus-chill-title" className="text-2xl font-bold text-white mb-4">Welcome to Nexus & Chill.</h2>
                        <p className="text-slate-300 text-lg mb-6">You get one attempt. This is quick (6 questions). If you start, you must finish. Do you accept?</p>
                        <div className="flex gap-4">
                             <button onClick={() => setStep('declined')} className="flex-1 bg-white/10 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20">No</button>
                             <button onClick={handleStart} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full hover:opacity-90">Yes, Start Test</button>
                        </div>
                    </>
                );
            case 'questions':
                return (
                    <form onSubmit={handleSubmit} className="text-left w-full">
                         <h2 id="nexus-chill-title" className="text-2xl font-bold text-white mb-6 text-center">Eligibility Test</h2>
                         <div className="space-y-6">
                            {questions.map(q => (
                                <fieldset key={q.id}>
                                    <legend className="font-medium text-gray-200 mb-2">{q.text}</legend>
                                    <div className="flex gap-4">
                                        {q.options.map(opt => (
                                            <label key={opt} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                                                <input type="radio" name={q.id} value={opt} onChange={(e) => handleAnswerChange(q.id, e.target.value)} required className="hidden peer"/>
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center peer-checked:border-nexusPurple-500 transition-colors">
                                                    <div className={`w-2.5 h-2.5 rounded-full transition-colors ${answers[q.id] === opt ? 'bg-nexusPurple-500' : 'bg-transparent'}`}></div>
                                                </div>
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ))}
                         </div>
                         <button type="submit" className="w-full mt-8 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full hover:opacity-90">Submit Answers - Final</button>
                    </form>
                );
            case 'result':
                const title = result?.finalStatus === 'PASS' ? 'PASS' : 'Pass';
                return (
                    <div className="text-center w-full">
                        <h2 id="nexus-chill-title" className={`text-3xl font-black mb-4 ${result?.finalStatus === 'PASS' ? 'text-green-400' : 'text-green-400'}`}>{title} — eligibility confirmed.</h2>
                        <div className="bg-black/20 border border-white/10 rounded-lg p-6">
                             <p className="text-lg text-gray-300">{currentUser.name || currentUser.email}</p>
                             <p className="text-sm text-gray-500 mb-4">{new Date().toLocaleString()}</p>
                             <p className="text-xl font-medium text-white italic mb-6">"{result?.narrative}"</p>
                             <p className="text-lg font-bold text-orange-400">Screenshot this and send to Daren.</p>
                        </div>
                        <button onClick={onClose} className="w-full mt-6 bg-white/10 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20">Close</button>
                    </div>
                );
            case 'alreadyUsed':
                 return <p id="nexus-chill-title" className="text-xl text-center text-amber-400">You have already used your single test. No further attempts allowed.</p>;
            case 'declined':
                 return <p id="nexus-chill-title" className="text-xl text-center text-gray-400">Test canceled. No attempt recorded.</p>;
            default:
                return <p id="nexus-chill-title" role="status">Loading...</p>;
        }
    };

    if (!isOpen) return null;

    return (
        <div 
          className="modal-overlay animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nexus-chill-title"
        >
            <div className="bg-[var(--modal-bg)] border border-[var(--ui-border-color)] rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-fade-in transition-colors duration-500 relative" onClick={(e) => e.stopPropagation()}>
                {step !== 'result' && (
                    <button ref={closeButtonRef} onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white" aria-label="Close">
                        <CloseIcon />
                    </button>
                )}
                {renderContent()}
            </div>
        </div>
    );
};