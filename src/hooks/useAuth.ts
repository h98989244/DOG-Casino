import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // 獲取當前使用者
        const getCurrentUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()

                if (error) {
                    setError(error.message)
                    setUser(null)
                } else {
                    setUser(user)
                    setError(null)
                }
            } catch (err: any) {
                setError(err.message || '獲取使用者資訊失敗')
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getCurrentUser()

        // 監聽認證狀態變化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return { user, loading, error }
}
