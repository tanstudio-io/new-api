import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export interface RechargeLink {
  id: number
  amount: number
  amount_label: string
  link: string
  sort_order: number
  enabled: boolean
}

export function useRechargeLinks() {
  const { t } = useTranslation()
  const [rechargeLinks, setRechargeLinks] = useState<RechargeLink[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRechargeLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/recharge-links', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setRechargeLinks(data.data || [])
      } else {
        toast.error(data.message || t('Failed to fetch recharge links'))
      }
    } catch (error) {
      console.error('Failed to fetch recharge links:', error)
      toast.error(t('Failed to fetch recharge links'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRechargeLinks()
  }, [])

  return {
    rechargeLinks,
    loading,
    refetch: fetchRechargeLinks,
  }
}
