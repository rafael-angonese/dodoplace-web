import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { PriceType, ServiceMode, ServiceType } from '@/lib/services'

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

export const SERVICE_REQUEST_MODE_LABEL: Record<ServiceMode, string> = {
  at_client: 'No meu endereço',
  at_provider: 'Posso ir até o profissional',
  remote: 'Pode ser feito a distância',
}

export const SERVICE_TYPE_BADGE: Record<ServiceType, string> = {
  offer: 'Serviço',
  request: 'Pedido',
}

export function serviceModeLabel(mode: ServiceMode, type: ServiceType) {
  return type === 'request'
    ? SERVICE_REQUEST_MODE_LABEL[mode]
    : SERVICE_MODE_LABEL[mode]
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

export function formatMessageTime(value: string) {
  return format(new Date(value), 'HH:mm')
}

export function formatConversationTime(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (isToday(date)) {
    return format(date, 'HH:mm')
  }

  if (isYesterday(date)) {
    return 'ontem'
  }

  return format(date, 'dd/MM/yy')
}

export function formatDayLabel(value: string) {
  const date = new Date(value)

  if (isToday(date)) {
    return 'Hoje'
  }

  if (isYesterday(date)) {
    return 'Ontem'
  }

  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatLastSeen(value: string | null) {
  if (!value) {
    return 'offline'
  }

  return `visto ${formatDistanceToNowStrict(new Date(value), {
    locale: ptBR,
    addSuffix: true,
  })}`
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return ''
  }

  const megabytes = bytes / (1024 * 1024)

  if (megabytes >= 1) {
    return `${megabytes.toFixed(1).replace('.', ',')} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
