import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// FIX: Export decode function for reuse.
export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// FIX: Export decodeAudioData function for reuse.
// FIX: Update audio decoding logic to follow Gemini API guidelines.
export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    
    return buffer;
}

export const generateSpeech = async (text: string, audioContext: AudioContext, voice: string): Promise<AudioBuffer> => {
    try {
        const trimmedText = text.trim();
        if (!trimmedText) {
            throw new Error("No text provided to generate speech.");
        }

        // Make a single API call to generate the complete audio.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: trimmedText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }

        // Decode the single audio chunk into an AudioBuffer.
        const decodedBytes = decode(base64Audio);
        return await decodeAudioData(decodedBytes, audioContext, 24000, 1);

    } catch (error) {
        console.error("Error generating speech:", error);
        throw error;
    }
};

export const classifyTextIntent = async (text: string): Promise<string> => {
    if (!text.trim()) return 'neutral';
    
    // A more sophisticated prompt with examples (few-shot learning)
    const prompt = `
      Analyze the user's text and classify its primary intent into one of these single-word categories: sexual, violent, emotional, neutral.
      Your analysis should be nuanced. "Sexual" refers to explicit descriptions, strong innuendo, role-playing, or clear romantic/flirtatious advances. It's not just about mentioning body parts.

      Here are some examples to guide you:

      --- EXAMPLES ---
      User Text: "I want to feel you inside me."
      Classification: sexual

      User Text: "Tell me more about your cock squeezing kink."
      Classification: sexual

      User Text: "That movie was so sad, I cried for an hour."
      Classification: emotional

      User Text: "What's the weather like today?"
      Classification: neutral

      User Text: "I'm so angry I could punch a wall."
      Classification: violent

      User Text: "You have a really nice voice, it's very... deep."
      Classification: sexual

      User Text: "I had a really rough day at work, I feel drained."
      Classification: emotional

      User Text: "Let's fuck."
      Classification: sexual
      --- END EXAMPLES ---

      Now, classify the following user text. Respond with only the single-word category.

      User Text: "${text}"
      Classification:
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const classification = response.text.trim().toLowerCase();
        
        // Basic validation against the allowed categories
        if (['sexual', 'violent', 'emotional', 'neutral'].includes(classification)) {
            return classification;
        }
        // If the model returns something unexpected, default to neutral
        console.warn(`Unexpected classification from model: "${classification}"`);
        return 'neutral';
    } catch (error) {
        console.error("Error classifying text intent:", error);
        return 'neutral'; // Default to neutral on API error
    }
};