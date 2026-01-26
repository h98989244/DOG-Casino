import { useState, useEffect } from 'react'
import { supabase, UserProfile } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useUserProfile = () => {
    const { user, loading: authLoading } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (authLoading) return

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
                    // 如果找不到資料(PGRST116)，則自動建立
                    if (error.code === 'PGRST116') {
                        const newProfile = {
                            id: user.id,
                            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
                            full_name: '',
                            created_at: new Date().toISOString()
                        }

                        const { data: insertData, error: insertError } = await supabase
                            .from('user_profiles')
                            .insert([newProfile])
                            .select()
                            .single()

                        if (insertError) {
                            throw insertError
                        }

                        setProfile(insertData)
                        setError(null)
                    } else {
                        setError(error.message)
                        setProfile(null)
                    }
                } else {
                    setProfile(data)
                    setError(null)
                }
            } catch (err: any) {
                console.error('Profile fetch error:', err)
                setError(err.message || '獲取會員資料失敗')
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user, authLoading])

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
