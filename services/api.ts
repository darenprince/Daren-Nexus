import { auth } from './firebase';

export const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) {
        return {};
    }

    try {
        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
        };
    } catch (error) {
        console.error('Error getting auth token:', error);
        return {};
    }
};
