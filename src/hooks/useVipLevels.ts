import { useState, useEffect } from 'react'
import { supabase, VipLevel } from '../lib/supabase'

export const useVipLevels = () => {
    const [vipLevels, setVipLevels] = useState<VipLevel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchVipLevels = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('vip_levels')
                    .select('*')
                    .order('level', { ascending: true })

                if (error) throw error
                setVipLevels(data || [])
                setError(null)
            } catch (err: any) {
                setError(err.message || '獲取 VIP 等級失敗')
                setVipLevels([])
            } finally {
                setLoading(false)
            }
        }

        fetchVipLevels()
    }, [])

    return { vipLevels, loading, error }
}
