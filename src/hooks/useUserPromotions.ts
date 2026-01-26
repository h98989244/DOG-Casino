import { useState, useEffect } from 'react'
import { supabase, UserPromotion, Promotion } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UserPromotionWithDetails extends UserPromotion {
    promotion: Promotion
}

export const useUserPromotions = () => {
    const { user } = useAuth()
    const [promotions, setPromotions] = useState<UserPromotionWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) {
            setPromotions([])
            setLoading(false)
            return
        }

        const fetchPromotions = async () => {
            try {
                setLoading(true)

                const { data, error } = await supabase
                    .from('user_promotions')
                    .select(`
                        *,
                        promotion:promotions(*)
                    `)
                    .eq('user_id', user.id)
                    .order('claimed_at', { ascending: false })

                if (error) {
                    setError(error.message)
                    setPromotions([])
                } else {
                    setPromotions(data || [])
                    setError(null)
                }
            } catch (err: any) {
                setError(err.message || '獲取優惠紀錄失敗')
                setPromotions([])
            } finally {
                setLoading(false)
            }
        }

        fetchPromotions()
    }, [user])

    return { promotions, loading, error }
}
