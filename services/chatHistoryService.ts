import type { ChatSession, Message } from '../types';
import { Sender } from '../types';
import { getCurrentSession, getArchivedSessions, saveArchivedSessions } from './persistenceService';

export const archiveCurrentSession = async (userHash: string): Promise<void> => {
    const messages = await getCurrentSession(userHash);
    if (!messages) return;

    if (messages.length > 2) { 
        const firstUserMessage = messages.find(m => m.sender === Sender.User);
        const summary = firstUserMessage 
            ? `We talked about "${firstUserMessage.text.substring(0, 50).trim()}..."` 
            : 'A conversation with the Nexus.';
        
        const sessionToArchive: ChatSession = {
            id: `session-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            summary,
            messages,
        };

        const archives = await getArchivedSessions(userHash) ?? [];
        archives.unshift(sessionToArchive);
        await saveArchivedSessions(userHash, archives);
    }
};


export const getSavedSessions = async (userHash: string): Promise<ChatSession[]> => {
    const [archives, currentMessages] = await Promise.all([
        getArchivedSessions(userHash),
        getCurrentSession(userHash)
    ]);

    const allSessions = archives ?? [];

    if (currentMessages && currentMessages.length > 1) {
        const firstUserMessage = currentMessages.find(m => m.sender === Sender.User);
        const summary = firstUserMessage 
            ? `Currently talking about "${firstUserMessage.text.substring(0, 50).trim()}..."`
            : 'Current Session';

        const currentSession: ChatSession = {
            id: 'current-session',
            timestamp: 'In Progress',
            summary: summary,
            messages: currentMessages,
        };
        return [currentSession, ...allSessions];
    }

    return allSessions;
};