import { useState, useEffect, useCallback } from 'react'
import { supabase, UserProfile } from '../lib/supabase'

export const useUserProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true)

            // 從 localStorage 讀取使用者資料
            const storedProfile = localStorage.getItem('userProfile')

            if (!storedProfile) {
                setProfile(null)
                setError('請先登入')
                setLoading(false)
                return
            }

            const userProfile = JSON.parse(storedProfile)
            setProfile(userProfile)
            setError(null)
        } catch (err: any) {
            console.error('Profile fetch error:', err)
            setError(err.message || '獲取會員資料失敗')
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!profile) {
            throw new Error('未登入')
        }

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', profile.id)
                .select()
                .single()

            if (error) {
                throw error
            }

            setProfile(data)
            // 更新 localStorage
            localStorage.setItem('userProfile', JSON.stringify(data))
            return { success: true, data }
        } catch (err: any) {
            return { success: false, error: err.message || '更新失敗' }
        }
    }

    return { profile, loading, error, updateProfile, refetch: fetchProfile }
}
