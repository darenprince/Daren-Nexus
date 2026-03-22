import { decode, decodeAudioData } from '../utils/audioUtils';

/**
 * Fetches the Gemini API key from the backend.
 * This is used for client-side features like Live Voice Mode.
 */
export const getApiKey = async (): Promise<string> => {
    try {
        const response = await fetch('/api/key');
        if (!response.ok) {
            throw new Error("Failed to fetch API key from server.");
        }
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error("Error fetching API key:", error);
        throw error;
    }
};

/**
 * Generates speech from text by calling the backend /api/speech endpoint.
 * @param text The text to be converted to speech.
 * @param audioContext The browser's AudioContext for decoding.
 * @param voice The desired voice for the speech synthesis.
 * @returns A promise that resolves to a playable AudioBuffer.
 */
export const generateSpeech = async (text: string, audioContext: AudioContext, voice: string): Promise<AudioBuffer> => {
    try {
        const trimmedText = text.trim();
        if (!trimmedText) {
            throw new Error("No text provided to generate speech.");
        }

        const response = await fetch('/api/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: trimmedText, voice }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate speech.");
        }

        const data = await response.json();
        const base64Audio = data.audioContent;
        
        if (!base64Audio) {
            throw new Error("No audio data received from server.");
        }

        const decodedBytes = decode(base64Audio);
        return await decodeAudioData(decodedBytes, audioContext, 24000, 1);

    } catch (error) {
        console.error("Error generating speech via backend:", error);
        throw error;
    }
};

/**
 * Classifies the intent of text by calling the backend /api/classify endpoint.
 * @param text The text to classify.
 * @returns A promise that resolves to the classification string (e.g., 'sexual').
 */
export const classifyTextIntent = async (text: string): Promise<string> => {
    if (!text.trim()) return 'neutral';

    try {
        const response = await fetch('/api/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            return 'neutral';
        }

        const data = await response.json();
        return data.classification || 'neutral';
    } catch (error) {
        console.error("Error classifying text via backend:", error);
        return 'neutral';
    }
};