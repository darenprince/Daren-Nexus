import { getAuthHeaders } from './api';
import { decode, decodeAudioData } from '../utils/audioUtils';

/**
 * Sends text to the backend server to generate speech.
 * This function calls the `/api/speech` endpoint, which securely handles the
 * call to the Gemini TTS model.
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

        const authHeaders = await getAuthHeaders();
        const response = await fetch('/api/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
            },
            body: JSON.stringify({ text: trimmedText, voice }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate speech on server.");
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
 * Sends text to the backend server to classify its intent.
 * This function calls the `/api/classify` endpoint, which uses a Gemini model
 * to determine if the text is sexual, violent, emotional, or neutral.
 * @param text The text to classify.
 * @returns A promise that resolves to the classification string (e.g., 'sexual').
 */
export const classifyTextIntent = async (text: string): Promise<string> => {
    if (!text.trim()) return 'neutral';

    try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch('/api/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            console.error("Server error during text classification.");
            return 'neutral';
        }

        const data = await response.json();
        return data.classification || 'neutral';
        
    } catch (error) {
        console.error("Error classifying text intent via backend:", error);
        return 'neutral'; // Default to neutral on API error
    }
};