export const LIFF_ID = import.meta.env.VITE_LIFF_ID || '';

export interface LiffUser {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
    email?: string;
}

export class LiffService {
    static async init(): Promise<{ isLoggedIn: boolean; error?: any }> {
        if (!LIFF_ID) {
            console.error('LIFF ID is not defined in .env');
            return { isLoggedIn: false, error: 'LIFF ID missing' };
        }

        try {
            if (!window.liff) {
                throw new Error('LIFF SDK not loaded');
            }

            await window.liff.init({ liffId: LIFF_ID });
            const isLoggedIn = window.liff.isLoggedIn();

            return { isLoggedIn };
        } catch (error) {
            console.error('LIFF initialization failed', error);
            return { isLoggedIn: false, error };
        }
    }

    static login(redirectUri?: string) {
        if (!window.liff) return;
        if (!window.liff.isLoggedIn()) {
            window.liff.login({
                redirectUri: redirectUri || window.location.href
            });
        }
    }

    static logout() {
        if (!window.liff) return;
        if (window.liff.isLoggedIn()) {
            window.liff.logout();
            window.location.reload();
        }
    }

    static async getProfile(): Promise<LiffUser | null> {
        if (!window.liff || !window.liff.isLoggedIn()) {
            return null;
        }

        try {
            const profile = await window.liff.getProfile();
            const decodedIDToken = window.liff.getDecodedIDToken();

            return {
                ...profile,
                email: decodedIDToken?.email
            };
        } catch (error: any) {
            console.error('Error getting profile:', error);
            // Handle token revocation
            if (error.message === 'The access token revoked') {
                this.logout();
            }
            return null;
        }
    }

    static isLoggedIn(): boolean {
        return window.liff?.isLoggedIn() || false;
    }

    static isInClient(): boolean {
        return window.liff?.isInClient() || false;
    }
}
