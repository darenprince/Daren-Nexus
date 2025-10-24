// FIX: Removed self-import of 'Sender' which was causing a conflict with the enum declaration below.
export interface Attachment {
  type: 'image';
  base64: string;
  mimeType: string;
}

export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: string;
  audioBuffer?: AudioBuffer; // For TTS playback
  attachments?: Attachment[];
  groundingMetadata?: any; // To store citations
}

export interface User {
  hash: string;
  email: string;
  name?: string;
  isGuest: boolean;
  isSpecialUser?: boolean;
  conversationFlags?: string[];
}

export interface Memory {
  id: string;
  ownerHash: string;
  preview: string;
  tags: string[];
  sensitivity: 'personal' | 'public' | 'vault';
}

export interface ChatSession {
  id: string;
  timestamp: string;
  summary: string;
  messages: Message[];
}