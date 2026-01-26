import { useState, useEffect } from 'react'
import { supabase, UserProfile } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useUserProfile = () => {
    const { user } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) {
            setProfile(null)
            setLoading(false)
            return
        }

        const fetchProfile = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    setError(error.message)
                    setProfile(null)
                } else {
                    setProfile(data)
                    setError(null)
                }
            } catch (err: any) {
                setError(err.message || '獲取會員資料失敗')
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user])

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) {
            throw new Error('未登入')
        }

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single()

            if (error) {
                throw error
            }

            setProfile(data)
            return { success: true, data }
        } catch (err: any) {
            return { success: false, error: err.message || '更新失敗' }
        }
    }

    return { profile, loading, error, updateProfile }
}
