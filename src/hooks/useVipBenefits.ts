import { useState, useEffect } from 'react'
import { supabase, VipBenefit } from '../lib/supabase'

export const useVipBenefits = (vipLevel: number | null) => {
    const [benefits, setBenefits] = useState<VipBenefit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (vipLevel === null) {
            setLoading(false)
            return
        }

        const fetchBenefits = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('vip_benefits')
                    .select('*')
                    .eq('vip_level', vipLevel)
                    .order('sort_order', { ascending: true })

                if (error) throw error
                setBenefits(data || [])
                setError(null)
            } catch (err: any) {
                setError(err.message || '獲取 VIP 權益失敗')
                setBenefits([])
            } finally {
                setLoading(false)
            }
        }

        fetchBenefits()
    }, [vipLevel])

    return { benefits, loading, error }
}
