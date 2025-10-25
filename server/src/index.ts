import express from 'express';
import cors from 'cors';
import path from 'path';
import { GoogleGenAI, Modality } from "@google/genai";
import 'dotenv/config';
import { modeDirectives, initialSystemInstruction } from './persona';

const app = express();
const port = process.env.PORT || 8080;

// --- Middleware Setup ---
app.use(cors()); 
app.use('/', express.json({ limit: '10mb' })); 

// --- Gemini API Initialization ---
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(express.static('public'));

// --- API Endpoints ---

/**
 * Endpoint for handling chat messages.
 */
app.post('/api/chat', async (req, res) => {
    const { message, mode, history, user, model, attachments, useWebSearch, quotedMessage } = req.body;

    if (!model) {
        return res.status(400).json({ error: "AI model must be specified." });
    }

    try {
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
        
        const formattedHistory = history || [];

        const finalMessage = quotedMessage 
            ? `In response to the user saying "${quotedMessage.text}", the user has now said: "${message}"`
            : message;

        const messageParts: any[] = [];
        if (finalMessage?.trim()) {
          messageParts.push({ text: finalMessage });
        }
        if (attachments && attachments.length > 0) {
            attachments.forEach((att: { mimeType: string; base64: string }) => {
                messageParts.push({
                    inlineData: {
                        mimeType: att.mimeType,
                        data: att.base64,
                    }
                });
            });
        }
        
        const contents = [...formattedHistory, { role: 'user', parts: messageParts }];

        const config: any = {
            systemInstruction: finalSystemInstruction,
        };
        
        if (useWebSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        if (['Deep Dive', 'Mentor Mode'].includes(mode)) {
            config.thinkingConfig = {
                thinkingBudget: model === 'gemini-2.5-pro' ? 8192 : 4096,
            };
        }

        const response = await ai.models.generateContent({
            model,
            contents,
            config,
        });

        res.json({ 
            text: response.text ?? '',
            groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        });
    } catch (error: any) {
        console.error("Error in /api/chat:", error);
        res.status(500).json({ error: "Damn, my connection to the ether is a bit fuzzy right now. The model might have flagged the request or an internal error occurred." });
    }
});

/**
 * Endpoint for generating speech from text.
 */
app.post('/api/speech', async (req, res) => {
    const { text, voice } = req.body;
    try {
        const trimmedText = text ? text.trim() : '';
        if (!trimmedText) {
            return res.status(400).json({ error: "No text provided to generate speech." });
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
        res.json({ audioContent: base64Audio });
    } catch (error) {
        console.error("Error in /api/speech:", error);
        res.status(500).json({ error: "Failed to generate speech." });
    }
});

/**
 * Endpoint for classifying the intent of a given text.
 */
app.post('/api/classify', async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.json({ classification: 'neutral' });
    }
    
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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const classification = response.text ? response.text.trim().toLowerCase() : 'neutral';
        
        if (['sexual', 'violent', 'emotional', 'neutral'].includes(classification)) {
            res.json({ classification });
        } else {
            console.warn(`Unexpected classification from model: "${classification}"`);
            res.json({ classification: 'neutral' });
        }
    } catch (error) {
        console.error("Error in /api/classify:", error);
        res.status(500).json({ error: "Failed to classify text." });
    }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// --- Server Startup ---
app.listen(port, () => {
    console.log(`Daren Nexus server is running on port ${port}`);
});
