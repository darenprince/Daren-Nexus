import type { User } from '../types';

const USERS_KEY = 'darenNexusUsers';
const CURRENT_USER_HASH_KEY = 'darenNexusCurrentUserHash';

// Internal type to include the password hash, which is never exposed to the app.
interface StoredUser extends User {
    passwordHash: string;
}

/**
 * A simple, non-secure hashing function for demonstration purposes.
 * In a real-world application, a robust library like bcrypt should be used.
 * @param password The password to hash.
 * @returns A base64 encoded string.
 */
const hashPassword = (password: string): string => {
    return btoa(password.split('').reverse().join(''));
};

const getUsers = (): StoredUser[] => {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
};

const saveUsers = (users: StoredUser[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const setCurrentUserHash = (hash: string, rememberMe: boolean): void => {
    // Guest sessions are always temporary (sessionStorage)
    const isGuest = hash.startsWith('nexus-guest-');
    const storage = (rememberMe && !isGuest) ? localStorage : sessionStorage;
    
    // To prevent conflicts, ensure the key is not in the other storage.
    if (storage === localStorage) {
        sessionStorage.removeItem(CURRENT_USER_HASH_KEY);
    } else {
        localStorage.removeItem(CURRENT_USER_HASH_KEY);
    }
    
    storage.setItem(CURRENT_USER_HASH_KEY, hash);
};

const getCurrentUserHash = (): string | null => {
    // Check local storage first (for remembered sessions), then session storage
    return localStorage.getItem(CURRENT_USER_HASH_KEY) || sessionStorage.getItem(CURRENT_USER_HASH_KEY);
};

export const loginOrSignup = (username: string, password: string, rememberMe: boolean): User => {
    const sanitizedUsername = username.trim().toLowerCase();
    if (!sanitizedUsername || !password) {
        throw new Error("Username and password cannot be empty.");
    }

    const isSpecial = sanitizedUsername === 'testfriend22';
    const users = getUsers();
    const existingUser = users.find(u => u.username === sanitizedUsername && !u.isGuest);

    if (existingUser) {
        // Login attempt
        const passwordHash = hashPassword(password);
        if (existingUser.passwordHash !== passwordHash) {
            throw new Error("Invalid password.");
        }
        setCurrentUserHash(existingUser.hash, rememberMe);
        // Return the safe User object, without the hash
        const { passwordHash: _, ...safeUser } = existingUser;
        return { ...safeUser, isSpecialUser: isSpecial };
    } else {
        // Signup
        const passwordHash = hashPassword(password);
        const newUser: StoredUser = {
            hash: `nexus-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            username: sanitizedUsername,
            passwordHash: passwordHash,
            isGuest: false,
            isSpecialUser: isSpecial,
        };
        users.push(newUser);
        saveUsers(users);
        setCurrentUserHash(newUser.hash, rememberMe);
        // Return the safe User object
        const { passwordHash: __, ...safeUser } = newUser;
        return safeUser;
    }
};

export const continueAsGuest = (): User => {
    const guestUser: User = {
        hash: `nexus-guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        username: 'guest',
        isGuest: true,
        isSpecialUser: false, // Guests cannot be special users
    };
    // Guest sessions are never remembered
    setCurrentUserHash(guestUser.hash, false);
    return guestUser;
};


export const getCurrentUser = (): User | null => {
    const userHash = getCurrentUserHash();
    if (!userHash) return null;

    if (userHash.startsWith('nexus-guest-')) {
        return {
            hash: userHash,
            username: 'guest',
            isGuest: true,
        };
    }

    const users = getUsers();
    const user = users.find(u => u.hash === userHash);

    if (user) {
        // Ensure the password hash is never returned
        const { passwordHash: _, ...safeUser } = user;
        // Re-check if this user is the special one on session load
        safeUser.isSpecialUser = safeUser.username === 'testfriend22';
        return safeUser;
    }
    
    return null;
};

export const saveCurrentUserName = async (hash: string, name: string): Promise<User | null> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.hash === hash);
    if (userIndex > -1) {
        users[userIndex].name = name;
        saveUsers(users);
        const { passwordHash: _, ...safeUser } = users[userIndex];
        return safeUser;
    }
    return null;
};

export const logout = (): void => {
    // Clear the user hash from both storages to ensure a clean logout.
    sessionStorage.removeItem(CURRENT_USER_HASH_KEY);
    localStorage.removeItem(CURRENT_USER_HASH_KEY);
};