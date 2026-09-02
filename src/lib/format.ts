import type { PriceType, ServiceMode } from '@/lib/services'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const rating = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export const PRICE_TYPE_SUFFIX: Record<PriceType, string> = {
  hourly: '/hora',
  daily: '/diária',
  fixed: '',
  quote: '',
}

export const PRICE_TYPE_LABEL: Record<PriceType, string> = {
  hourly: 'Por hora',
  daily: 'Por diária',
  fixed: 'Preço fechado',
  quote: 'Orçamento a combinar',
}

export const SERVICE_MODE_LABEL: Record<ServiceMode, string> = {
  at_client: 'Atende em domicílio',
  at_provider: 'No local do profissional',
  remote: 'Atende a distância',
}

export function formatPrice(cents: number | null) {
  if (cents === null) {
    return null
  }

  return currency.format(cents / 100)
}

export function formatServicePrice(priceType: PriceType, cents: number | null) {
  const value = formatPrice(cents)

  if (!value) {
    return 'Orçamento a combinar'
  }

  return `${value}${PRICE_TYPE_SUFFIX[priceType]}`
}

export function formatRating(value: number) {
  return rating.format(value)
}

export function formatDistance(km: number | null) {
  if (km === null) {
    return null
  }

  if (km < 1) {
    return 'menos de 1 km'
  }

  return `${rating.format(km).replace(',0', '')} km`
}

export function formatReviewsCount(count: number) {
  if (count === 0) {
    return 'sem avaliações'
  }

  return count === 1 ? '1 avaliação' : `${count} avaliações`
}

export function whatsappLink(phone: string | null, message?: string) {
  if (!phone) {
    return null
  }

  const digits = phone.replace(/\D/g, '')

  if (digits.length < 10) {
    return null
  }

  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  const query = message ? `?text=${encodeURIComponent(message)}` : ''

  return `https://wa.me/${withCountry}${query}`
}

export function instagramLink(handle: string | null) {
  if (!handle) {
    return null
  }

  return `https://instagram.com/${handle.replace(/^@/, '')}`
}
