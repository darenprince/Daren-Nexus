import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import type { Message, User } from '../types';
import { Sender } from '../types';
import { initialSystemInstruction, modeDirectives } from './persona';

interface SendMessageOptions {
    useWebSearch?: boolean;
}

// The response from our new client-side function matches the old server response structure
export interface SendMessageResponse {
    text: string;
    groundingMetadata?: any;
}

const getAi = () => {
    if (!process.env.API_KEY) {
        // This will be caught by the UI and shown to the user.
        throw new Error("Application is not configured correctly. API_KEY is missing.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Sends a chat message and its context directly to the Google Gemini API.
 * This function constructs the full prompt, including system instructions and
 * persona, and calls the Gemini API client-side.
 */
export const sendMessage = async (
    message: string, 
    mode: string,
    history: Message[],
    user: User | undefined,
    model: string,
    attachments: { file: File; base64: string }[],
    quotedMessage: Message | null,
    options: SendMessageOptions = {},
    abortSignal?: AbortSignal // Note: AbortSignal is not natively supported by the SDK's generateContent call.
): Promise<SendMessageResponse> => {
    
    const ai = getAi();

    // Replicate server-side persona logic to build the system instruction
    let effectiveMode = mode;
    if (user?.isSpecialUser && mode === 'Fuck It') {
        effectiveMode = 'Fuck It (Seductive)';
    }
    const modeDirective = modeDirectives[effectiveMode as keyof typeof modeDirectives] || modeDirectives['Real Talk'];
    
    const finalSystemInstruction = `
        ${initialSystemInstruction}
        // --- CURRENT MODE DIRECTIVE: ${mode} ---
        ${modeDirective}
    `;

    // Format history for the Gemini API
    const recentHistory = history.slice(-10);
    const formattedHistory = recentHistory.map(msg => {
        const parts: any[] = [];
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (msg.sender === Sender.User && msg.attachments) {
            msg.attachments.forEach(att => {
                parts.push({
                    inlineData: {
                        mimeType: att.mimeType,
                        data: att.base64
                    }
                });
            });
        }
        return {
            role: msg.sender === Sender.User ? 'user' : 'model',
            parts,
        };
    });

    const finalMessageText = quotedMessage 
        ? `In response to the user saying "${quotedMessage.text}", the user has now said: "${message}"`
        : message;

    const messageParts: any[] = [];
    if (finalMessageText?.trim()) {
      messageParts.push({ text: finalMessageText });
    }
    if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
            messageParts.push({
                inlineData: {
                    mimeType: att.file.type,
                    data: att.base64,
                }
            });
        });
    }

    const contents = [...formattedHistory, { role: 'user', parts: messageParts }];

    const config: any = {
        systemInstruction: finalSystemInstruction,
    };
    
    if (options.useWebSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    if (['Deep Dive', 'Mentor Mode'].includes(mode)) {
        config.thinkingConfig = {
            thinkingBudget: model === 'gemini-2.5-pro' ? 8192 : 4096,
        };
    }

    try {
        // The AbortController in App.tsx will throw an error if cancelled before the call.
        // We check it here to stop the request from being made.
        if (abortSignal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents,
            config,
        });

        return {
            text: response.text,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        };
    } catch (error) {
        console.error("Error calling Gemini API client-side:", error);
        if (error instanceof Error && error.name === 'AbortError') {
            throw error; // Re-throw AbortError to be handled by the UI
        }
        // Provide a more user-friendly error
        throw new Error("Failed to get a response from the AI. The model may have blocked the request or an internal error occurred.");
    }
};
