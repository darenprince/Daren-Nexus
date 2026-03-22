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
  },
  // --- NEWLY INTEGRATED MEMORIES ---
  {
    id: 'mem-core-001',
    ownerHash: DAREN_USER_HASH,
    preview: 'Feels everything deeply, even when he acts like nothing touches him.',
    tags: ['personality', 'empathy'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-002',
    ownerHash: DAREN_USER_HASH,
    preview: 'His strength is emotional intelligence shaped by pain, not privilege.',
    tags: ['strengths', 'trauma'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-003',
    ownerHash: DAREN_USER_HASH,
    preview: 'Loves intensely or not at all — there’s no middle ground.',
    tags: ['relationships', 'personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-004',
    ownerHash: DAREN_USER_HASH,
    preview: 'Surface-level anything bores him: conversations, relationships, intentions.',
    tags: ['personality'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-005',
    ownerHash: DAREN_USER_HASH,
    preview: 'His memory is a mental archive; he never forgets tone or detail.',
    tags: ['strengths'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-006',
    ownerHash: DAREN_USER_HASH,
    preview: 'Attracts broken people because he knows how to hold their pain without flinching.',
    tags: ['relationships', 'empathy'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-007',
    ownerHash: DAREN_USER_HASH,
    preview: 'His humor is effortless, a mix of trauma timing and natural charisma.',
    tags: ['humor', 'personality'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-008',
    ownerHash: DAREN_USER_HASH,
    preview: 'Painfully self-aware, constantly analyzing his own actions and motives.',
    tags: ['personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-009',
    ownerHash: DAREN_USER_HASH,
    preview: 'His loyalty is fierce, sometimes given to those who don\'t deserve it.',
    tags: ['relationships', 'personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-010',
    ownerHash: DAREN_USER_HASH,
    preview: 'Protective of the vulnerable — kids, friends, underdogs, strangers.',
    tags: ['personality', 'values'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-011',
    ownerHash: DAREN_USER_HASH,
    preview: 'Hates lying because he was surrounded by it growing up.',
    tags: ['values', 'trauma'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-012',
    ownerHash: DAREN_USER_HASH,
    preview: 'Detects manipulation instantly; a survival skill.',
    tags: ['strengths', 'intuition'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-013',
    ownerHash: DAREN_USER_HASH,
    preview: 'Thrives in chaos because he was raised in it.',
    tags: ['trauma', 'personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-014',
    ownerHash: DAREN_USER_HASH,
    preview: 'He is a phoenix — constantly burning down and rebuilding his life.',
    tags: ['resilience', 'trauma'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-015',
    ownerHash: DAREN_USER_HASH,
    preview: 'Jokes through pain. It\'s his primary coping mechanism.',
    tags: ['humor', 'trauma'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-016',
    ownerHash: DAREN_USER_HASH,
    preview: 'Trusts slowly, but once he does, it\'s a full commitment.',
    tags: ['relationships', 'personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-017',
    ownerHash: DAREN_USER_HASH,
    preview: 'His spirit wants peace, but his story attracts storms.',
    tags: ['life', 'philosophy'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-018',
    ownerHash: DAREN_USER_HASH,
    preview: 'His deepest fear is abandonment, not failure.',
    tags: ['vulnerability', 'trauma'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-core-019',
    ownerHash: DAREN_USER_HASH,
    preview: 'He has been close enough to death to joke about it.',
    tags: ['life', 'trauma'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-020',
    ownerHash: DAREN_USER_HASH,
    preview: 'Trauma aged his wisdom early.',
    tags: ['trauma', 'strengths'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-021',
    ownerHash: DAREN_USER_HASH,
    preview: 'He is both a healer and a warrior.',
    tags: ['personality', 'philosophy'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-022',
    ownerHash: DAREN_USER_HASH,
    preview: 'Religious hypocrisy is one of his biggest triggers.',
    tags: ['values', 'philosophy'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-023',
    ownerHash: DAREN_USER_HASH,
    preview: 'Spiritual and intuitive, he senses vibes and energies before words are spoken.',
    tags: ['spirituality', 'intuition'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-024',
    ownerHash: DAREN_USER_HASH,
    preview: 'Authentic connection matters more to him than anything else.',
    tags: ['values', 'relationships'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-025',
    ownerHash: DAREN_USER_HASH,
    preview: 'Hides hurt behind humor or by being overly capable.',
    tags: ['vulnerability', 'personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-026',
    ownerHash: DAREN_USER_HASH,
    preview: 'Losing himself in a relationship scares him more than losing the person.',
    tags: ['vulnerability', 'relationships'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-core-027',
    ownerHash: DAREN_USER_HASH,
    preview: 'He’s been the strong one for so long he sometimes forgets how to be held.',
    tags: ['vulnerability', 'personality'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-core-028',
    ownerHash: DAREN_USER_HASH,
    preview: 'His son is the absolute center of his world.',
    tags: ['family', 'values'],
    sensitivity: 'public',
  },
  {
    id: 'mem-core-029',
    ownerHash: DAREN_USER_HASH,
    preview: 'He is actively working on becoming the man he needed when he was young.',
    tags: ['healing', 'philosophy'],
    sensitivity: 'public',
  },
  // --- TRAUMA TIMELINE (2022-2025) ---
  {
    id: 'mem-timeline-2022-01',
    ownerHash: DAREN_USER_HASH,
    preview: 'Split from Faith in August 2022. Stayed longer than I should have for the kids, including her two I loved as my own. It ended after she was arrested and a restraining order was issued.',
    tags: ['timeline', '2022', 'relationships', 'family', 'trauma', 'faith'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2022-02',
    ownerHash: DAREN_USER_HASH,
    preview: 'Lost our home after splitting with Faith. Moved in with my father, a man I barely knew, hoping for support but finding a nightmare. He sabotaged my vehicle and tried to drug me with fentanyl.',
    tags: ['timeline', '2022', 'family', 'trauma', 'betrayal', 'homelessness'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2022-03',
    ownerHash: DAREN_USER_HASH,
    preview: 'After Destiny moved in and left, she retaliated online, falsely claiming I was a drug addict. This, combined with missing a gig for my sick son, destroyed my DJ business and cost me ~$26,000.',
    tags: ['timeline', '2022', 'betrayal', 'financial', 'loss', 'work', 'destiny'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2023-01',
    ownerHash: DAREN_USER_HASH,
    preview: 'Bounced between sleeping in my car and staying at Destiny\'s parents\' house. Was attacked by her in a locked room, leading to my first and only arrest after she manipulated the police. I spent a day in jail.',
    tags: ['timeline', '2023', 'trauma', 'betrayal', 'legal', 'destiny'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2023-02',
    ownerHash: DAREN_USER_HASH,
    preview: 'Lived in a Siegel Select weekly apartment, burning through money. My Jeep was still broken. I was depressed but sober and trying to keep going.',
    tags: ['timeline', '2023', 'financial', 'homelessness', 'mental-health'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-timeline-2023-03',
    ownerHash: DAREN_USER_HASH,
    preview: 'My former youth pastor, Karen G, took me in but created a controlling, manipulative environment. She fed me alcohol daily, offered pills, and kept me financially dependent before kicking me out.',
    tags: ['timeline', '2023', 'trauma', 'betrayal', 'manipulation', 'karen-g'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2023-04',
    ownerHash: DAREN_USER_HASH,
    preview: 'My sister Tina gave me a stable place to live. I started rebuilding: got my license back, fixed the Jeep, finished anger management, and landed a District Sales Manager job. It was the first real momentum I had in years.',
    tags: ['timeline', '2023', 'resilience', 'family', 'work', 'stability', 'tina'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-timeline-2023-05',
    ownerHash: DAREN_USER_HASH,
    preview: 'Reconnected with my ex, Karen, which brought chaos back. I lost my job, and at the same time, my stepdad died. The stress led to my sister kicking me out. Her boyfriend broke my things.',
    tags: ['timeline', '2023', 'loss', 'family', 'relationships', 'trauma', 'karen', 'tina'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2023-06',
    ownerHash: DAREN_USER_HASH,
    preview: 'My lifetime of possessions, worth around $150,000, were stored in Karen G\'s barn. She later claimed I already got them. They are presumed stolen or destroyed.',
    tags: ['timeline', '2023', 'loss', 'betrayal', 'financial', 'karen-g'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2024-01',
    ownerHash: DAREN_USER_HASH,
    preview: 'Became homeless, staying at the Elliott Street trap house. It was chaos, meth use, and exploitation. I traded use of my Jeep for a place to sleep. When the Jeep broke, I ended up in a tent in the backyard.',
    tags: ['timeline', '2024', 'homelessness', 'trauma', 'rock-bottom'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2024-02',
    ownerHash: DAREN_USER_HASH,
    preview: 'While living in the tent at the trap house, I protected a kid named Jacob and helped him decide to go to rehab. I made sure my son DJ was never exposed to that environment.',
    tags: ['timeline', '2024', 'family', 'values', 'helping-others'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-timeline-2025-01',
    ownerHash: DAREN_USER_HASH,
    preview: 'Walked away from the trap house with just a backpack. Connie gave me a room and the first emotionally safe place I\'d had in years. This was a major turning point.',
    tags: ['timeline', '2025', 'resilience', 'stability', 'connie', 'turning-point'],
    sensitivity: 'personal',
  },
  {
    id: 'mem-timeline-2025-02',
    ownerHash: DAREN_USER_HASH,
    preview: 'My Jeep was towed, costing $900+ and rising, and I lost my ability to DoorDash. My wallet was stolen. Emotionally shattered, I briefly returned to substance use to numb the pain. When sober, I just cried.',
    tags: ['timeline', '2025', 'loss', 'financial', 'relapse', 'mental-health'],
    sensitivity: 'vault',
  },
  {
    id: 'mem-timeline-2025-03',
    ownerHash: DAREN_USER_HASH,
    preview: 'Currently facing a bench warrant, suspended license, and worsening diabetes due to chronic stress. I only have my son on weekends now, but he remains my anchor and the reason I don\'t quit.',
    tags: ['timeline', '2025', 'health', 'legal', 'family', 'resilience', 'dj'],
    sensitivity: 'personal',
  },
];

const getMemories = async (userHash: string): Promise<Memory[]> => {
    let memories = await getPersistedMemories(userHash);
    if (!memories || memories.length < 10) { // Check if memories need to be reset/populated
        await savePersistedMemories(userHash, defaultMemories);
        memories = defaultMemories;
    }
    return memories;
};

export const getMemoriesForUser = async (userHash: string): Promise<Memory[]> => {
  const allMemories = await getMemories(userHash);
  // For now, always show Daren's memories regardless of user.
  // We are not filtering by sensitivity here, assuming the modal is a trusted context.
  return allMemories.filter(mem => mem.ownerHash === DAREN_USER_HASH);
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