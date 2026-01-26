interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

interface LiffConfig {
    liffId: string;
}

interface LiffLoginConfig {
    redirectUri?: string;
}

interface LiffError {
    code: string;
    message: string;
}

interface Liff {
    init(config: LiffConfig): Promise<void>;
    getOS(): string;
    getLanguage(): string;
    getVersion(): string;
    getLineVersion(): string | null;
    isInClient(): boolean;
    isLoggedIn(): boolean;
    login(config?: LiffLoginConfig): void;
    logout(): void;
    getAccessToken(): string | null;
    getIDToken(): string | null;
    getDecodedIDToken(): { email?: string } | null; // Simplified
    getProfile(): Promise<LiffProfile>;
    closeWindow(): void;
    openWindow(params: { url: string; external?: boolean }): void;
    sendMessages(messages: any[]): Promise<void>;
    ready: Promise<void>;
    id: string | null;
}

interface Window {
    liff: Liff;
}
