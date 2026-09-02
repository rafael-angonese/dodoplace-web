import type { PriceType, ServiceMode, ServiceSort } from '@/lib/services'

const SORTS: ServiceSort[] = [
  'relevance',
  'distance',
  'rating',
  'price_asc',
  'price_desc',
  'recent',
]

const MODES: ServiceMode[] = ['at_client', 'at_provider', 'remote']

const PRICE_TYPES: PriceType[] = ['hourly', 'daily', 'fixed', 'quote']

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type ServiceSearch = {
  q?: string
  category?: string
  cityId?: number
  state?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  minPriceCents?: number
  maxPriceCents?: number
  minRating?: number
  mode?: ServiceMode
  priceType?: PriceType
  sort?: ServiceSort
}

function text(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : undefined
}

function positive(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function coordinate(value: unknown, limit: number) {
  const parsed = Number(value)

  return Number.isFinite(parsed) && Math.abs(parsed) <= limit
    ? parsed
    : undefined
}

function oneOf<T extends string>(value: unknown, options: T[]) {
  return typeof value === 'string' && options.includes(value as T)
    ? (value as T)
    : undefined
}

export function validateServiceSearch(
  search: Record<string, unknown>,
): ServiceSearch {
  const category = text(search.category)
  const state = text(search.state)?.toUpperCase()
  const minRating = positive(search.minRating)

  return {
    q: text(search.q),
    category: category && SLUG_PATTERN.test(category) ? category : undefined,
    cityId: positive(search.cityId),
    state: state && /^[A-Z]{2}$/.test(state) ? state : undefined,
    latitude: coordinate(search.latitude, 90),
    longitude: coordinate(search.longitude, 180),
    radiusKm: positive(search.radiusKm),
    minPriceCents: positive(search.minPriceCents),
    maxPriceCents: positive(search.maxPriceCents),
    minRating: minRating && minRating <= 5 ? minRating : undefined,
    mode: oneOf(search.mode, MODES),
    priceType: oneOf(search.priceType, PRICE_TYPES),
    sort: oneOf(search.sort, SORTS),
  }
}

export function hasActiveFilters(search: ServiceSearch) {
  return Object.values(search).some((value) => value !== undefined)
}
