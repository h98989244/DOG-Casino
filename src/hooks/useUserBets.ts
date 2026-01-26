import { useState, useEffect } from 'react'
import { supabase, Bet } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UseUserBetsOptions {
    limit?: number
    gameType?: string
    status?: string
}

export const useUserBets = (options: UseUserBetsOptions = {}) => {
    const { user } = useAuth()
    const [bets, setBets] = useState<Bet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)

    const { limit = 20, gameType, status } = options

    useEffect(() => {
        if (!user) {
            setBets([])
            setLoading(false)
            return
        }

        const fetchBets = async () => {
            try {
                setLoading(true)

                let query = supabase
                    .from('bets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(limit)

                if (gameType) {
                    query = query.eq('game_type', gameType)
                }

                if (status) {
                    query = query.eq('status', status)
                }

                const { data, error } = await query

                if (error) {
                    setError(error.message)
                    setBets([])
                } else {
                    setBets(data || [])
                    setHasMore((data?.length || 0) >= limit)
                    setError(null)
                }
            } catch (err: any) {
                setError(err.message || '獲取投注紀錄失敗')
                setBets([])
            } finally {
                setLoading(false)
            }
        }

        fetchBets()
    }, [user, limit, gameType, status])

    return { bets, loading, error, hasMore }
}
