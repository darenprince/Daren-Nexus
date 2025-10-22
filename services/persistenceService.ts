import type { User, Message, ChatSession, Memory } from '../types';

// Key Prefixes
const PFX = 'darenNexus';

// Key Generator
const getKey = (base: string, userHash: string) => `${PFX}_${base}_${userHash}`;

// --- "Nexus & Chill" Attempt Tracking ---
export const hasAttemptedNexusAndChill = async (userHash: string): Promise<boolean> => {
    try {
        return localStorage.getItem(getKey('nexusChillAttempt', userHash)) === 'true';
    } catch (error) {
        console.error("Persistence error:", error);
        return false;
    }
};

export const recordNexusAndChillAttempt = async (userHash: string): Promise<void> => {
    try {
        localStorage.setItem(getKey('nexusChillAttempt', userHash), 'true');
    } catch (error) {
        console.error("Persistence error:", error);
    }
};


// --- User Profile (The only non-user-specific key is the list of users itself) ---
export const saveUser = async (userHash: string, user: User): Promise<void> => {
    // This is a bit different as it's part of the global user list, but for consistency
    // we can imagine a "profile" for each user.
    // The authService handles the list, this could save user-specific profile details.
    try {
        localStorage.setItem(getKey('userProfile', userHash), JSON.stringify(user));
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getUser = async (userHash: string): Promise<User | null> => {
    // The authService is the source of truth now, but this could get extended profile info.
    try {
        const raw = localStorage.getItem(getKey('userProfile', userHash));
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};


// --- Chat History ---
export const saveCurrentSession = async (userHash: string, messages: Message[]): Promise<void> => {
    try {
        localStorage.setItem(getKey('chatHistory', userHash), JSON.stringify(messages));
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getCurrentSession = async (userHash: string): Promise<Message[] | null> => {
    try {
        const raw = localStorage.getItem(getKey('chatHistory', userHash));
        return raw ? JSON.parse(raw) : []; // Return empty array if null
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};

export const saveArchivedSessions = async (userHash: string, sessions: ChatSession[]): Promise<void> => {
    try {
        localStorage.setItem(getKey('archivedSessions', userHash), JSON.stringify(sessions));
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getArchivedSessions = async (userHash: string): Promise<ChatSession[] | null> => {
    try {
        const raw = localStorage.getItem(getKey('archivedSessions', userHash));
        return raw ? JSON.parse(raw) : []; // Return empty array if null
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};


// --- Memories ---
export const saveMemories = async (userHash: string, memories: Memory[]): Promise<void> => {
    try {
        localStorage.setItem(getKey('memories', userHash), JSON.stringify(memories));
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getMemories = async (userHash: string): Promise<Memory[] | null> => {
    try {
        const raw = localStorage.getItem(getKey('memories', userHash));
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};


// --- Settings ---
export const saveTtsVoice = async (userHash: string, voice: string): Promise<void> => {
    try {
        localStorage.setItem(getKey('ttsVoice', userHash), voice);
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getTtsVoice = async (userHash: string): Promise<string | null> => {
    try {
        return localStorage.getItem(getKey('ttsVoice', userHash));
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};

export const saveTextZoom = async (userHash: string, zoom: number): Promise<void> => {
    try {
        localStorage.setItem(getKey('textZoom', userHash), String(zoom));
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getTextZoom = async (userHash: string): Promise<number | null> => {
    try {
        const raw = localStorage.getItem(getKey('textZoom', userHash));
        return raw ? Number(raw) : null;
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};

export const saveTheme = async (userHash: string, theme: string): Promise<void> => {
    try {
        localStorage.setItem(getKey('theme', userHash), theme);
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getTheme = async (userHash: string): Promise<string | null> => {
    try {
        return localStorage.getItem(getKey('theme', userHash));
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};

// --- Live System Instruction ---
export const saveLiveSystemInstruction = async (userHash: string, instruction: string): Promise<void> => {
    try {
        localStorage.setItem(getKey('liveSystemInstruction', userHash), instruction);
    } catch (error) {
        console.error("Persistence error:", error);
    }
};

export const getLiveSystemInstruction = async (userHash: string): Promise<string | null> => {
    try {
        return localStorage.getItem(getKey('liveSystemInstruction', userHash));
    } catch (error) {
        console.error("Persistence error:", error);
        return null;
    }
};


// --- Logout/Reset ---
export const clearUserSessionData = async (userHash: string): Promise<void> => {
    try {
        // This only clears the current session, not archives or settings.
        localStorage.removeItem(getKey('chatHistory', userHash));
    } catch (error) {
        console.error("Persistence error:", error);
    }
};