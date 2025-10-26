import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    onAuthStateChanged,
    signOut,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';
import type { User } from '../types';

const SPECIAL_USER_EMAIL = 'testfriend22@daren.prince';

const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser): User => {
    return {
        hash: firebaseUser.uid,
        email: firebaseUser.email || (firebaseUser.isAnonymous ? 'guest' : ''),
        name: firebaseUser.displayName || undefined,
        isGuest: firebaseUser.isAnonymous,
        isSpecialUser: firebaseUser.email === SPECIAL_USER_EMAIL,
    };
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            callback(mapFirebaseUserToAppUser(firebaseUser));
        } else {
            callback(null);
        }
    });
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserToAppUser(userCredential.user);
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserToAppUser(userCredential.user);
};

export const continueAsGuest = async (): Promise<User> => {
    const userCredential = await signInAnonymously(auth);
    return mapFirebaseUserToAppUser(userCredential.user);
};

export const logout = (): Promise<void> => {
    return signOut(auth);
};

export const saveCurrentUserName = async (name: string): Promise<User | null> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await updateProfile(currentUser, { displayName: name });
        return mapFirebaseUserToAppUser(currentUser);
    }
    return null;
};
