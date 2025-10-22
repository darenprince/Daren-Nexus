import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Update import for `QRCode` component from `qrcode.react` to use a named import (`QRCodeSVG`) to resolve JSX component type error. The component is aliased to `QRCode` to avoid changing its usage in the code.
import { QRCodeSVG as QRCode } from 'qrcode.react';

const NEXUS_WHO_ATTEMPT_KEY = 'darenNexusWhoAttempt';

// --- Questions ---
const questions = [
  // Machiavellianism
  { id: 'q1', text: "I'm comfortable bending rules to get what I want.", trait: 'M', weight: 1.2 },
  { id: 'q7', text: 'I prefer making strategic long-term plans rather than being sentimental.', trait: 'M', weight: 1.2 },
  { id: 'q9', text: 'I admire people who get ahead by any means.', trait: 'M', weight: 1.2 },
  { id: 'q13', text: 'I find it easy to manipulate a partner into doing things my way.', trait: 'M', weight: 1.3 },
  { id: 'q15', text: 'I think most people are too trusting and naive.', trait: 'M', weight: 1.2 },
  
  // Narcissism
  { id: 'q3', text: 'I enjoy being the center of attention.', trait: 'N', weight: 1.0 },
  { id: 'q5', text: 'I often feel entitled to more than others.', trait: 'N', weight: 1.0 },
  { id: 'q11', text: 'I believe charisma and charm are useful tools.', trait: 'N', weight: 1.0 },
  { id: 'q12', text: 'I often exaggerate my achievements to impress others.', trait: 'N', weight: 1.0 },
  { id: 'q16', text: 'I sometimes brag about things I haven’t actually done.', trait: 'N', weight: 1.0 },

  // Psychopathy
  { id: 'q4', text: 'If someone insults me, I get even.', trait: 'P', weight: 1.4 },
  { id: 'q6', text: 'I can be emotionally cold when needed.', trait: 'P', weight: 1.4 },
  { id: 'q10', text: 'I rarely feel guilt after hurting someone to protect myself.', trait: 'P', weight: 1.4 },
  { id: 'q14', text: 'I take risks without worrying about emotional fallout for others.', trait: 'P', weight: 1.4 },
  { id: 'q18', text: 'I have intentionally caused problems for someone to gain advantage.', trait: 'P', weight: 1.4 },

  // Manipulation/Deception
  { id: 'q2', text: 'People are tools you use to reach your goals.', trait: 'MD', weight: 1.3 },
  { id: 'q8', text: 'I would lie to avoid losing a relationship if it helped my goals.', trait: 'MD', weight: 1.3 },
  { id: 'q17', text: 'When angry, I prefer cold control rather than an outburst.', trait: 'P', weight: 1.0 }, // Also relates to psychopathy

  // Lie Traps
  { id: 'q19', text: 'I change my story when it benefits me.', trait: 'LT', weight: 0 },
  { id: 'q20', text: 'I sometimes promise things I never intended to keep.', trait: 'LT', weight: 0 },
];

const likertOptions = ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'];
const likertScores = [0, 1, 2, 3];

type Step = 'checking' | 'intro' | 'questions' | 'result' | 'alreadyUsed' | 'declined';
type Answers = { [key: string]: { value: number; latency: number } };
type Result = {
  band: 'GREEN' | 'YELLOW' | 'RED';
  narrative: string;
  qrPayload: string;
  verificationToken: string;
  audit: string;
};

const NexusWhoTest: React.FC = () => {
    const [step, setStep] = useState<Step>('checking');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [result, setResult] = useState<Result | null>(null);
    const [startTime, setStartTime] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState(questions);

    useEffect(() => {
        const hasAttempted = localStorage.getItem(NEXUS_WHO_ATTEMPT_KEY);
        if (hasAttempted) {
            setStep('alreadyUsed');
        } else {
            setStep('intro');
            // Shuffle questions once on load
            setShuffledQuestions(q => [...q].sort(() => Math.random() - 0.5));
        }
    }, []);

    const handleStart = () => {
        localStorage.setItem(NEXUS_WHO_ATTEMPT_KEY, 'started');
        setStartTime(Date.now());
        setStep('questions');
    };
    
    const handleAnswer = (questionId: string, value: number) => {
        const latency = Date.now() - startTime;
        setAnswers(prev => ({ ...prev, [questionId]: { value, latency } }));
        setStartTime(Date.now()); // Reset for next question
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question answered, process results
            processAndShowResult({ ...answers, [questionId]: { value, latency } });
        }
    };

    const processAndShowResult = (finalAnswers: Answers) => {
        // --- Scoring Logic ---
        let scores = { N: 0, M: 0, P: 0, MD: 0 };
        let maxScores = { N: 0, M: 0, P: 0, MD: 0 };
        
        questions.forEach(q => {
          const answer = finalAnswers[q.id];
          if (answer) {
            if (q.trait === 'N') {
              scores.N += answer.value * q.weight;
              maxScores.N += 3 * q.weight;
            } else if (q.trait === 'M') {
              scores.M += answer.value * q.weight;
              maxScores.M += 3 * q.weight;
            } else if (q.trait === 'P') {
              scores.P += answer.value * q.weight;
              maxScores.P += 3 * q.weight;
            }
             if (q.trait === 'MD') {
              scores.MD += answer.value * q.weight;
              maxScores.MD += 3 * q.weight;
            }
          }
        });

        const normalizedN = (scores.N / maxScores.N) * 100;
        const normalizedM = (scores.M / maxScores.M) * 100;
        const normalizedP = (scores.P / maxScores.P) * 100;
        const manipulationRisk = (scores.MD / maxScores.MD) * 100;
        const darkTriadIndex = (normalizedN + normalizedM + normalizedP) / 3;

        // --- Masking Detection ---
        let maskingPenalty = 0;
        let maskingFlags = [];
        const fastAnswers = Object.values(finalAnswers).filter(a => a.latency < 400).length;
        if (fastAnswers > 6) {
          maskingPenalty = 0.15;
          maskingFlags.push(`Masking Flag: High response velocity (${fastAnswers} items < 400ms).`);
        }
        // Simplified contradiction check for demo
        const lieTrapScore = (finalAnswers['q19']?.value || 0) + (finalAnswers['q20']?.value || 0);
        if (lieTrapScore > 3) {
            maskingPenalty = Math.max(maskingPenalty, 0.15); // Don't double-penalize
            maskingFlags.push(`Masking Flag: Contradictory answers on lie-trap items (Score: ${lieTrapScore}).`);
        }
        const finalIndex = darkTriadIndex * (1 + maskingPenalty);

        // --- Banding & Immediate Fails ---
        let band: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
        let safetyRisks = [];
        if ((finalAnswers['q4']?.value || 0) >= 2 && (finalAnswers['q14']?.value || 0) >= 2) {
          band = 'RED';
          safetyRisks.push('SAFETY RISK: High indication of retribution and lack of remorse.');
        }
        if ((finalAnswers['q18']?.value || 0) === 3) {
          band = 'RED';
          safetyRisks.push('SAFETY RISK: Admission of intentional harm for advantage.');
        }
        if (band !== 'RED') {
            if (finalIndex >= 60 || manipulationRisk >= 50) band = 'RED';
            else if (finalIndex >= 30 || manipulationRisk >= 25) band = 'YELLOW';
        }

        // --- Result Content ---
        const narrativeMap = {
            GREEN: "Low risk and good vibes — you’re Nexus-compatible.",
            YELLOW: "Mixed signals — proceed with caution.",
            RED: "High risk — visitor not recommended."
        };
        const verificationToken = Math.random().toString(36).substring(2, 10).toUpperCase();
        const timestamp = new Date().toISOString();
        const respondentId = "guest-" + Date.now().toString(36); // Simple ID for this context
        const qrPayload = `${respondentId}|${timestamp}|${band}|${Math.round(finalIndex)}|${verificationToken}`;

        // --- Audit Generation ---
        const auditText = `
NEXUS WHO - AUDIT REPORT
----------------------------------
Respondent ID: ${respondentId}
Timestamp: ${timestamp}
----------------------------------
ANSWERS:
${shuffledQuestions.map(q => `${q.id} (${q.trait}): ${finalAnswers[q.id]?.value ?? 'N/A'} (Latency: ${finalAnswers[q.id]?.latency ?? 'N/A'}ms)`).join('\n')}
----------------------------------
SCORES:
Narcissism (Normalized): ${normalizedN.toFixed(2)}
Machiavellianism (Normalized): ${normalizedM.toFixed(2)}
Psychopathy (Normalized): ${normalizedP.toFixed(2)}
---
Manipulation Risk Score: ${manipulationRisk.toFixed(2)}
Dark Triad Index (Pre-Penalty): ${darkTriadIndex.toFixed(2)}
Masking Penalty: +${maskingPenalty * 100}%
FINAL Dark Triad Index: ${finalIndex.toFixed(2)}
----------------------------------
FINAL DECISION:
Band: ${band}
QR Payload: ${qrPayload}
Verification Token: ${verificationToken}
----------------------------------
FLAGS:
${maskingFlags.length > 0 ? maskingFlags.join('\n') : 'None'}
${safetyRisks.length > 0 ? safetyRisks.join('\n') : 'None'}
`;
        setResult({
            band,
            narrative: narrativeMap[band],
            qrPayload,
            verificationToken,
            audit: auditText,
        });

        setStep('result');
    };

    const Header = () => (
      <header className="w-full max-w-4xl mx-auto p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Nexus Who — One attempt.</h1>
        <div>
          <a href="#" onClick={() => window.close()} className="text-gray-400 hover:text-white mr-4">X</a>
          <a href="#" onClick={() => setStep('declined')} className="text-gray-400 hover:text-white">Oops, nevermind!</a>
        </div>
      </header>
    );

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Welcome to Nexus Who — one attempt only.</h2>
                        <p className="text-gray-300 max-w-prose mx-auto mb-6">This is a 20-question compatibility and risk screen (not a clinical diagnosis). Answer honestly. No neutral answers. Do you accept?</p>
                        <p className="text-sm text-gray-500 mb-8">Disclaimer: This is not a medical or psychiatric diagnosis. For mental health or safety concerns consult a licensed professional.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setStep('declined')} className="flex-1 bg-white/10 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20">No</button>
                            <button onClick={handleStart} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full hover:opacity-90">Start test — 1 attempt</button>
                        </div>
                    </div>
                );
            case 'questions':
                const question = shuffledQuestions[currentQuestionIndex];
                return (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                           <div className="progress-bar-fill h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                        </div>
                        <p className="text-center text-sm text-gray-400 mb-8">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <h2 className="text-2xl font-semibold text-center mb-8">{question.text}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {likertOptions.map((option, index) => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(question.id, likertScores[index])}
                                    className="radio-label w-full text-left p-4 rounded-lg border-2 border-gray-700 hover:border-purple-600 transition-colors"
                                >
                                    <input type="radio" name="option" value={likertScores[index]} className="hidden" />
                                    <span>{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'result':
                if (!result) return <p>Calculating...</p>;
                const bandColor = result.band === 'GREEN' ? 'bg-green-500' : result.band === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500';
                const bandText = result.band === 'GREEN' ? 'Pass' : result.band === 'YELLOW' ? 'Caution' : 'Not Recommended';
                const mailtoLink = `mailto:daren.prince@gmail.com?subject=URGENT: Nexus Who Audit&body=${encodeURIComponent(result.audit)}`;
                return (
                    <div className="w-full max-w-md mx-auto text-center bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-4">Nexus Who — Results</h2>
                        <div className={`w-full h-4 rounded-full mb-4 ${bandColor}`}></div>
                        <p className="text-xl font-bold mb-6">{bandText}</p>
                        <p className="text-lg text-gray-300 italic mb-6">"{result.narrative}"</p>
                        <p className="text-lg font-bold text-orange-400 mb-6">Screenshot this page and send the QR code below to Daren.</p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                           <QRCode value={result.qrPayload} size={192} />
                        </div>
                        <p className="font-mono text-xl tracking-widest mt-4">{result.verificationToken}</p>
                        <a href={mailtoLink} className="text-xs text-gray-600 mt-4 block">(Simulated Audit Email)</a>
                    </div>
                );
            case 'alreadyUsed':
                return <p className="text-xl text-center text-amber-400">You have already used your single Nexus Who test. No further attempts allowed.</p>;
            case 'declined':
                return <p className="text-xl text-center text-gray-400">Test canceled. No attempt recorded.</p>;
            default:
                return <p>Loading...</p>;
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center">
            <Header />
            <main className="flex-1 flex items-center justify-center w-full p-4">
                {renderContent()}
            </main>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<NexusWhoTest />);