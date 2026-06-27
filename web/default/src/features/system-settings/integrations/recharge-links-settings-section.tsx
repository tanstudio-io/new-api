/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Trash2, Save, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SettingsSection } from '../components/settings-section'

interface RechargeLink {
  id: number
  amount: number
  amount_label: string
  link: string
  sort_order: number
  enabled: boolean
}

export function RechargeLinksSettingsSection() {
  const { t } = useTranslation()
  const [links, setLinks] = useState<RechargeLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recharge-link/', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setLinks(data.data || [])
      } else {
        toast.error(data.message || t('Failed to fetch'))
      }
    } catch (error) {
      console.error('Failed to fetch recharge links:', error)
      toast.error(t('Failed to fetch'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleUpdateLink = (id: number, field: keyof RechargeLink, value: any) => {
    setLinks(links.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const handleAddLink = () => {
    const newLink: RechargeLink = {
      id: 0, // 0 means new
      amount: 0,
      amount_label: '',
      link: '',
      sort_order: links.length + 1,
      enabled: true,
    }
    setLinks([...links, newLink])
  }

  const handleDeleteLink = (index: number) => {
    const link = links[index]
    if (link.id !== 0) {
      // Delete from server
      fetch(`/api/recharge-link/${link.id}`, {
        method: 'DELETE',
      }).then(response => response.json())
        .then(data => {
          if (data.success) {
            toast.success(t('Deleted successfully'))
            setLinks(links.filter((_, i) => i !== index))
          } else {
            toast.error(data.message || t('Failed to delete'))
          }
        })
        .catch(() => {
          toast.error(t('Failed to delete'))
        })
    } else {
      setLinks(links.filter((_, i) => i !== index))
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/recharge-link/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(links),
      })
      const data = await response.json()
      if (data.success) {
        toast.success(t('Saved successfully'))
        fetchLinks() // Refresh to get IDs for new items
      } else {
        toast.error(data.message || t('Failed to save'))
      }
    } catch (error) {
      console.error('Failed to save recharge links:', error)
      toast.error(t('Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection
      title={t('Recharge Links')}
    >
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-medium'>{t('Recharge Links')}</h3>
            <p className='text-muted-foreground text-xs'>
              {t('Configure the links for each recharge amount. Users will be redirected to these links when they click on the recharge buttons.')}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleAddLink}>
              <Plus className='mr-2 h-4 w-4' />
              {t('Add')}
            </Button>
            <Button size='sm' onClick={handleSave} disabled={saving}>
              <Save className='mr-2 h-4 w-4' />
              {saving ? t('Saving...') : t('Save')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2' />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Amount')}</TableHead>
                <TableHead>{t('Label')}</TableHead>
                <TableHead>{t('Link')}</TableHead>
                <TableHead>{t('Sort')}</TableHead>
                <TableHead>{t('Enabled')}</TableHead>
                <TableHead className='w-[100px]'>{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link, index) => (
                <TableRow key={link.id || `new-${index}`}>
                  <TableCell>
                    <Input
                      type='number'
                      value={link.amount}
                      onChange={(e) =>
                        handleUpdateLink(link.id, 'amount', parseInt(e.target.value) || 0)
                      }
                      className='w-24'
                      placeholder='100'
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={link.amount_label}
                      onChange={(e) =>
                        handleUpdateLink(link.id, 'amount_label', e.target.value)
                      }
                      className='w-24'
                      placeholder='1￥'
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={link.link}
                      onChange={(e) =>
                        handleUpdateLink(link.id, 'link', e.target.value)
                      }
                      className='min-w-[200px]'
                      placeholder='https://9.plus/...'
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type='number'
                      value={link.sort_order}
                      onChange={(e) =>
                        handleUpdateLink(link.id, 'sort_order', parseInt(e.target.value) || 0)
                      }
                      className='w-20'
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={link.enabled}
                      onCheckedChange={(checked) =>
                        handleUpdateLink(link.id, 'enabled', checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      {link.link && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => window.open(link.link, '_blank')}
                        >
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDeleteLink(index)}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {links.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground py-8 text-center'>
                    {t('No recharge links configured. Click "Add" to create one.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <div className='text-muted-foreground text-xs'>
          <p>{t('Note: The amount is in cents (fen). For example, 100 represents 1 yuan.')}</p>
          <p>{t('Users will see these as quick recharge buttons on the wallet page.')}</p>
        </div>
      </div>
    </SettingsSection>
  )
}
