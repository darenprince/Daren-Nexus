import type { Message, User } from '../types';
import { Sender } from '../types';

interface SendMessageOptions {
    useWebSearch?: boolean;
}

interface SendMessageResponse {
    text: string;
    groundingMetadata?: any;
}

/**
 * Sends a chat message and its context to the application's backend server.
 * This function acts as a client for the `/api/chat` endpoint. It formats the
 * chat history, includes the current mode and system instruction, and sends
 * everything to the server, which will then securely call the Google Gemini API.
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
    abortSignal?: AbortSignal
): Promise<SendMessageResponse> => {
    
    // Take only the last 10 messages to keep the payload small and relevant.
    const recentHistory = history.slice(-10);
    
    // Format the history into the structure expected by the backend and Gemini API.
    const formattedHistory = recentHistory.map(msg => {
        const parts: (({ text: string; } | { inlineData: { mimeType: string; data: string; }; }))[] = [];
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
    
    const attachmentPayload = attachments.map(att => ({
        mimeType: att.file.type,
        base64: att.base64,
    }));

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                mode,
                history: formattedHistory,
                user,
                model,
                attachments: attachmentPayload,
                useWebSearch: options.useWebSearch || false,
                quotedMessage: quotedMessage,
            }),
            signal: abortSignal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend API Error:", errorData);
            throw new Error(errorData.error || "An error occurred while communicating with the server.");
        }

        const data: SendMessageResponse = await response.json();
        return data;

    } catch (error) {
        console.error("Fetch API Error:", error);
        throw error;
    }
};
