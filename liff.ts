// LIFF 工具函數
export const LIFF_ID = import.meta.env.VITE_LIFF_ID || ''

// 初始化 LIFF
export async function initLiff(): Promise<boolean> {
    try {
        if (!window.liff) {
            console.error('LIFF SDK not loaded')
            return false
        }

        if (!LIFF_ID) {
            console.error('LIFF ID not configured')
            return false
        }

        await window.liff.init({ liffId: LIFF_ID })
        console.log('LIFF initialized successfully')
        return true
    } catch (error) {
        console.error('LIFF initialization failed:', error)
        return false
    }
}

// 檢查是否已登入
export function isLiffLoggedIn(): boolean {
    return window.liff?.isLoggedIn() || false
}

// 執行 LIFF 登入
export function liffLogin(redirectUri?: string): void {
    if (!window.liff) {
        console.error('LIFF SDK not loaded')
        return
    }

    const config = redirectUri ? { redirectUri } : undefined
    window.liff.login(config)
}

// 執行 LIFF 登出
export function liffLogout(): void {
    if (!window.liff) {
        console.error('LIFF SDK not loaded')
        return
    }

    window.liff.logout()
}

// 獲取用戶資料
export async function getLiffProfile() {
    if (!window.liff) {
        throw new Error('LIFF SDK not loaded')
    }

    if (!window.liff.isLoggedIn()) {
        throw new Error('User not logged in')
    }

    const profile = await window.liff.getProfile()
    const accessToken = window.liff.getAccessToken()
    const idToken = window.liff.getIDToken()
    const decodedIdToken = window.liff.getDecodedIDToken()

    return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        accessToken,
        idToken,
        email: decodedIdToken?.email
    }
}

// 檢查是否在 LINE 客戶端中
export function isInLineClient(): boolean {
    return window.liff?.isInClient() || false
}

// 獲取 LIFF 環境資訊
export function getLiffContext() {
    if (!window.liff) {
        return null
    }

    return {
        os: window.liff.getOS(),
        language: window.liff.getLanguage(),
        version: window.liff.getVersion(),
        lineVersion: window.liff.getLineVersion(),
        isInClient: window.liff.isInClient(),
        isLoggedIn: window.liff.isLoggedIn()
    }
}
