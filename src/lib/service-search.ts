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
  categoria?: string
  cidadeId?: number
  uf?: string
  latitude?: number
  longitude?: number
  raioKm?: number
  precoMin?: number
  precoMax?: number
  notaMin?: number
  modo?: ServiceMode
  tipoPreco?: PriceType
  ordenar?: ServiceSort
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
  const categoria = text(search.categoria)
  const uf = text(search.uf)?.toUpperCase()
  const notaMin = positive(search.notaMin)

  return {
    q: text(search.q),
    categoria: categoria && SLUG_PATTERN.test(categoria) ? categoria : undefined,
    cidadeId: positive(search.cidadeId),
    uf: uf && /^[A-Z]{2}$/.test(uf) ? uf : undefined,
    latitude: coordinate(search.latitude, 90),
    longitude: coordinate(search.longitude, 180),
    raioKm: positive(search.raioKm),
    precoMin: positive(search.precoMin),
    precoMax: positive(search.precoMax),
    notaMin: notaMin && notaMin <= 5 ? notaMin : undefined,
    modo: oneOf(search.modo, MODES),
    tipoPreco: oneOf(search.tipoPreco, PRICE_TYPES),
    ordenar: oneOf(search.ordenar, SORTS),
  }
}

export function hasActiveFilters(search: ServiceSearch) {
  return Object.values(search).some((value) => value !== undefined)
}
