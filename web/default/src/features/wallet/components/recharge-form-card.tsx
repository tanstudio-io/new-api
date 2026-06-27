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
import { Gift, ExternalLink, Loader2, Receipt, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { TitledCard } from '@/components/ui/titled-card'
import type {
  CreemProduct,
} from '../types'
import { CreemProductsSection } from './creem-products-section'
import { useRechargeLinks } from '../hooks/use-recharge-links'

interface RechargeFormCardProps {
  topupLink?: string
  loading?: boolean
  onOpenBilling?: () => void
  creemProducts?: CreemProduct[]
  enableCreemTopup?: boolean
  onCreemProductSelect?: (product: CreemProduct) => void
  redemptionCode: string
  onRedemptionCodeChange: (code: string) => void
  onRedeem: () => void
  redeeming: boolean
  enableRedemption?: boolean
}

export function RechargeFormCard({
  topupLink,
  loading,
  onOpenBilling,
  creemProducts,
  enableCreemTopup,
  onCreemProductSelect,
  redemptionCode,
  onRedemptionCodeChange,
  onRedeem,
  redeeming,
  enableRedemption = true,
}: RechargeFormCardProps) {
  const { t } = useTranslation()
  const { rechargeLinks, loading: rechargeLinksLoading } = useRechargeLinks()

  if (loading) {
    return (
      <Card data-card-hover='false' className='gap-0 overflow-hidden py-0'>
        <CardHeader className='border-b p-3 !pb-3 sm:p-5 sm:!pb-5'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='mt-2 h-4 w-48' />
        </CardHeader>
        <CardContent className='space-y-4 p-3 sm:space-y-6 sm:p-5'>
          {/* Quick Recharge Skeleton */}
          <div className='space-y-3'>
            <Skeleton className='h-3 w-16' />
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className='h-[72px] rounded-lg' />
              ))}
            </div>
          </div>

          {/* Redemption Code Section Skeleton */}
          <div className='space-y-3 border-t pt-8'>
            <Skeleton className='h-3 w-24' />
            <div className='flex gap-2'>
              <Skeleton className='h-10 flex-1' />
              <Skeleton className='h-10 w-20' />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TitledCard
      title={t('Add Funds')}
      description={t('Choose an amount and payment method')}
      icon={<WalletCards className='h-4 w-4' />}
      disableHoverEffect
      action={
        onOpenBilling ? (
          <Button
            variant='outline'
            size='sm'
            onClick={onOpenBilling}
            className='w-full gap-2 sm:w-auto'
          >
            <Receipt className='h-4 w-4' />
            {t('Order History')}
          </Button>
        ) : null
      }
      contentClassName='space-y-4 sm:space-y-6'
    >
      {/* Recharge Links Section */}
      <div className='space-y-2.5 sm:space-y-3'>
        <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          {t('Quick Recharge')}
        </Label>
        {rechargeLinksLoading ? (
          <div className='grid grid-cols-2 gap-1.5 sm:gap-3 md:grid-cols-4'>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className='h-[72px] rounded-lg' />
            ))}
          </div>
        ) : rechargeLinks.length > 0 ? (
          <div className='grid grid-cols-2 gap-1.5 sm:gap-3 md:grid-cols-4'>
            {rechargeLinks.map((link) => (
              <Button
                key={link.id}
                variant='outline'
                className='flex min-h-16 flex-col items-center justify-center rounded-lg px-3 py-2.5 whitespace-normal sm:min-h-[72px] sm:p-4'
                onClick={() => {
                  if (link.link) {
                    window.open(link.link, '_blank')
                  } else {
                    toast.error(t('Recharge link not configured'))
                  }
                }}
                disabled={!link.link}
              >
                <div className='text-base font-semibold sm:text-lg'>
                  {link.amount_label}
                </div>
                <div className='text-muted-foreground mt-1 text-xs'>
                  {t('Click to recharge')}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              {t('No recharge options available. Please contact administrator.')}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Creem Products Section */}
      {enableCreemTopup &&
        Array.isArray(creemProducts) &&
        creemProducts.length > 0 &&
        onCreemProductSelect && (
          <div className='space-y-2.5 border-t pt-4 sm:space-y-3 sm:pt-6'>
            <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
              {t('Creem Payment')}
            </Label>
            <CreemProductsSection
              products={creemProducts}
              onProductSelect={onCreemProductSelect}
            />
          </div>
        )}

      {/* Redemption Code Section - Now the main input area */}
      {enableRedemption ? (
        <div className='space-y-2.5 border-t pt-4 sm:space-y-3 sm:pt-6'>
          <div className='flex items-center gap-2'>
            <Gift className='text-muted-foreground h-4 w-4' />
            <Label
              htmlFor='redemption-code'
              className='text-muted-foreground text-xs font-medium tracking-wider uppercase'
            >
              {t('Have a Code?')}
            </Label>
          </div>
          <div className='grid grid-cols-[minmax(0,1fr)_auto] gap-2'>
            <Input
              id='redemption-code'
              value={redemptionCode}
              onChange={(e) => onRedemptionCodeChange(e.target.value)}
              placeholder={t('Enter your redemption code')}
              className='h-9 min-w-0'
            />
            <Button
              onClick={onRedeem}
              disabled={redeeming}
              variant='outline'
              className='h-9 px-4'
            >
              {redeeming && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('Redeem')}
            </Button>
          </div>
          {topupLink && (
            <p className='text-muted-foreground text-xs'>
              {t('Need a redemption code?')}{' '}
              <a
                href={topupLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 underline-offset-4 hover:underline'
              >
                {t('Get one here')}
                <ExternalLink className='h-3 w-3' />
              </a>
            </p>
          )}
        </div>
      ) : (
        <Alert className='border-t'>
          <AlertDescription>
            {t(
              'Redemption codes are disabled until the administrator confirms compliance terms.'
            )}
          </AlertDescription>
        </Alert>
      )}
    </TitledCard>
  )
}
