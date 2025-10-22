import type { Memory } from '../types';
import { getMemories as getPersistedMemories, saveMemories as savePersistedMemories } from './persistenceService';

const DAREN_USER_HASH = 'daren-prince-hash-12345';

const defaultMemories: Memory[] = [
  {
    id: 'mem-20150510-002',
    ownerHash: DAREN_USER_HASH,
    preview: 'First regional sales win. The team was a family; we doubled down and pulled off miracles.',
    tags: ['work', 'pride'],
    sensitivity: 'public',
  },
  {
    id: 'mem-20240702-003',
    ownerHash: DAREN_USER_HASH,
    preview: 'Parking-lot BBQ after the Bath Planet record. We celebrated like idiots and it felt holy.',
    tags: ['life', 'celebration'],
    sensitivity: 'public',
  },
  {
    id: 'mem-20250120-005',
    ownerHash: DAREN_USER_HASH,
    preview: 'Game On book launch — seeing the reviews made me realize people needed blunt honesty, not fluff.',
    tags: ['author', 'mission'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-20241013-009',
    ownerHash: DAREN_USER_HASH,
    preview: 'The Daren Nexus idea first sketched at 3AM — half-caffeinated and fully obsessed.',
    tags: ['project', 'origin'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-20190309-007',
    ownerHash: DAREN_USER_HASH,
    preview: 'I love drums; I can feel rhythm like a language.',
    tags: ['music'],
    sensitivity: 'public',
  }
];

const getMemories = async (userHash: string): Promise<Memory[]> => {
    let memories = await getPersistedMemories(userHash);
    if (!memories) {
        await savePersistedMemories(userHash, defaultMemories);
        memories = defaultMemories;
    }
    return memories;
};

export const getMemoriesForUser = async (userHash: string): Promise<Memory[]> => {
  const allMemories = await getMemories(userHash);
  // For now, always show Daren's memories regardless of user. This could be changed later.
  return allMemories.filter(mem => mem.ownerHash === DAREN_USER_HASH).slice(0, 3);
};

export const addMemory = async (userHash: string, preview: string): Promise<void> => {
    const allMemories = await getMemories(userHash);
    const newMemory: Memory = {
        id: `mem-vault-${Date.now()}`,
        ownerHash: DAREN_USER_HASH, // Stays as Daren's memory
        preview,
        tags: ['vault', 'user-added'],
        sensitivity: 'vault',
    };
    allMemories.push(newMemory);
    await savePersistedMemories(userHash, allMemories);
    console.log('New memory added and persisted:', newMemory);
};