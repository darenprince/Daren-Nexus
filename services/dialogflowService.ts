import { GoogleGenAI, Type } from "@google/genai";
import type { Message, User } from '../types';
import { Sender } from '../types';
import { modeDirectives } from './persona';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const sendMessageToDialogflow = async (
    message: string, 
    mode: string,
    history: Message[],
    systemInstruction: string, // Base live instruction
    user: User | undefined,
    model: string,
    attachments: { file: File; base64: string }[]
): Promise<string> => {
    
    // --- Persona Adaptation for Special User ---
    let effectiveMode = mode;
    if (user?.isSpecialUser && mode === 'Fuck-It') {
        effectiveMode = 'Fuck-It (Seductive)';
    }

    // 1. Select the appropriate behavioral directive for the current mode.
    const modeDirective = modeDirectives[effectiveMode as keyof typeof modeDirectives] || modeDirectives['Real Talk'];

    // 2. Construct the final, layered system instruction for this specific call.
    const finalSystemInstruction = `
        ${systemInstruction}

        // --- CURRENT MODE DIRECTIVE: ${mode} ---
        // (Effective directive: ${effectiveMode})
        ${modeDirective}
        // --- END MODE DIRECTIVE ---
    `;
    
    // 3. Take only the last 10 messages to keep the payload small and relevant.
    const recentHistory = history.slice(-10);
    
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

    const messageParts: (({ text: string; } | { inlineData: { mimeType: string; data: string; }; }))[] = [];
    if (message.trim()) {
      messageParts.push({ text: message });
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

    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: finalSystemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error details:", error);
        return "Damn, my connection to the ether is a bit fuzzy right now. The model might have flagged the request. Try rephrasing, or check the console logs for details.";
    }
};


/**
 * Processes a developer command to update application logic or persona.
 * @param command The developer's instruction.
 * @param currentSystemInstruction The current system instruction for context.
 * @returns A JSON string with the update payload.
 */
export const processDeveloperCommand = async (command: string, currentSystemInstruction: string): Promise<string> => {
    const instruction = `You are the core logic controller for the Daren Nexus AI. You have received a high-priority developer command. Your task is to interpret this command and generate a JSON object to update the AI's configuration. The only valid update type is 'systemInstruction'. You must return the *entire*, new, complete system instruction in the payload.

    This is the AI's CURRENT system instruction for your reference:
    ---
    ${currentSystemInstruction}
    ---

    This is the developer's command:
    ---
    ${command}
    ---

    Now, generate the JSON response. The 'payload' field must contain the full, updated system instruction. Do not omit any part of the original instruction unless the command explicitly says to.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Use the more powerful model for this critical task.
            contents: instruction,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        updateType: { type: Type.STRING, description: "The type of update to perform. Must be 'systemInstruction'." },
                        payload: { type: Type.STRING, description: "The full, new system instruction text." },
                    },
                    required: ["updateType", "payload"],
                },
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error processing developer command:", error);
        const errorPayload = {
            error: "Failed to process command.",
            details: error instanceof Error ? error.message : String(error)
        };
        return JSON.stringify(errorPayload);
    }
};