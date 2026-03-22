import type { Message, User } from '../types';

export interface SendMessageResponse {
    text: string;
    groundingMetadata?: any;
}

/**
 * Sends a chat message and its context to the backend API.
 */
export const sendMessage = async (
    message: string, 
    mode: string,
    history: Message[],
    user: User | undefined,
    model: string,
    attachments: { file: File; base64: string }[],
    quotedMessage: Message | null,
    options: { useWebSearch?: boolean } = {},
    abortSignal?: AbortSignal
): Promise<SendMessageResponse> => {
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                mode,
                history,
                user,
                model,
                attachments: attachments.map(a => ({ mimeType: a.file.type, base64: a.base64 })),
                useWebSearch: options.useWebSearch,
                quotedMessage,
            }),
            signal: abortSignal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to get a response from the AI.");
        }

        const data = await response.json();
        return { 
            text: data.text || '',
            groundingMetadata: data.groundingMetadata,
        };

    } catch (error) {
        console.error("Error calling backend chat API:", error);
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        throw new Error(error instanceof Error ? error.message : "Failed to get a response from the AI. Check your network connection.");
    }
};