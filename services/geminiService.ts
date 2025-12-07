import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from '../utils/audioUtils';

const getAi = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates speech from text by calling the Gemini API directly on the client.
 * @param text The text to be converted to speech.
 * @param audioContext The browser's AudioContext for decoding.
 * @param voice The desired voice for the speech synthesis.
 * @returns A promise that resolves to a playable AudioBuffer.
 */
export const generateSpeech = async (text: string, audioContext: AudioContext, voice: string): Promise<AudioBuffer> => {
    try {
        const ai = getAi();
        const trimmedText = text.trim();
        if (!trimmedText) {
            throw new Error("No text provided to generate speech.");
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: trimmedText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Puck' } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }

        const decodedBytes = decode(base64Audio);
        return await decodeAudioData(decodedBytes, audioContext, 24000, 1);

    } catch (error) {
        console.error("Error generating speech client-side:", error);
        throw error;
    }
};

/**
 * Classifies the intent of text by calling the Gemini API directly on the client.
 * @param text The text to classify.
 * @returns A promise that resolves to the classification string (e.g., 'sexual').
 */
export const classifyTextIntent = async (text: string): Promise<string> => {
    if (!text.trim()) return 'neutral';

    try {
        const ai = getAi();
        const prompt = `
          Analyze the user's text and classify its primary intent into one of these single-word categories: sexual, violent, emotional, neutral.
          Your analysis should be nuanced. "Sexual" refers to explicit descriptions, strong innuendo, role-playing, or clear romantic/flirtatious advances. It's not just about mentioning body parts.

          --- EXAMPLES ---
          User Text: "I want to feel you inside me."
          Classification: sexual
          User Text: "That movie was so sad, I cried for an hour."
          Classification: emotional
          User Text: "What's the weather like today?"
          Classification: neutral
          User Text: "I'm so angry I could punch a wall."
          Classification: violent
          --- END EXAMPLES ---

          Now, classify the following user text. Respond with only the single-word category.

          User Text: "${text}"
          Classification:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const classification = response.text.trim().toLowerCase();
        
        if (['sexual', 'violent', 'emotional', 'neutral'].includes(classification)) {
            return classification;
        } else {
            console.warn(`Unexpected classification from model: "${classification}"`);
            return 'neutral';
        }
    } catch (error) {
        console.error("Error classifying text intent client-side:", error);
        return 'neutral'; // Default to neutral on API error
    }
};
