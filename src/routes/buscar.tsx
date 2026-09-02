import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { useLocation } from '@/components/location/location-context'

import { CategoryCarousel } from '@/components/discovery/category-carousel'
import { SearchBar } from '@/components/discovery/search-bar'
import { SearchEmptyState } from '@/components/discovery/search-empty-state'
import {
  type SearchFiltersValue,
  SearchFilters,
} from '@/components/discovery/search-filters'
import { ServiceCard } from '@/components/discovery/service-card'
import { SortSelect } from '@/components/discovery/sort-select'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { Pagination } from '@/components/ui/pagination'
import { categoriesApi } from '@/lib/categories'
import { locationsApi } from '@/lib/locations'
import {
  type PriceType,
  type ServiceMode,
  type ServiceSort,
  servicesApi,
} from '@/lib/services'

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

export type BuscarSearch = {
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
  pagina?: number
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

export const Route = createFileRoute('/buscar')({
  component: Buscar,
  head: () => ({ meta: [{ title: 'Buscar serviços | FazPerto' }] }),
  validateSearch: (search: Record<string, unknown>): BuscarSearch => {
    const categoria = text(search.categoria)
    const uf = text(search.uf)?.toUpperCase()
    const notaMin = positive(search.notaMin)

    return {
      q: text(search.q),
      categoria:
        categoria && SLUG_PATTERN.test(categoria) ? categoria : undefined,
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
      pagina: positive(search.pagina),
    }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [categories, results, city] = await Promise.all([
      categoriesApi.list(),
      servicesApi.search({ ...deps, porPagina: 24 }),
      deps.cidadeId ? locationsApi.city(deps.cidadeId).catch(() => null) : null,
    ])

    return { categories, results, city }
  },
})

function Buscar() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { categories, results, city } = Route.useLoaderData()
  const { city: storedCity, setCity } = useLocation()
  const didSeedFromStoredCity = useRef(false)

  useEffect(() => {
    if (city || didSeedFromStoredCity.current || !storedCity) {
      return
    }

    didSeedFromStoredCity.current = true

    navigate({
      to: '/buscar',
      search: (current) => ({ ...current, cidadeId: storedCity.id }),
      replace: true,
    })
  }, [city, storedCity, navigate])

  useEffect(() => {
    if (city && storedCity?.id !== city.id) {
      setCity(city)
    }
  }, [city, storedCity, setCity])

  const category = categories.find((entry) => entry.slug === search.categoria)
  const hasCoordinates =
    search.latitude !== undefined && search.longitude !== undefined

  const cityLabel = city?.label ?? null

  const title = category
    ? `${category.name}${cityLabel ? ` em ${cityLabel}` : ''}`
    : cityLabel
      ? `Serviços em ${cityLabel}`
      : 'Serviços perto de você'

  function update(next: Partial<BuscarSearch>) {
    navigate({
      to: '/buscar',
      search: (current) => ({ ...current, ...next, pagina: undefined }),
    })
  }

  function onApplyFilters(filters: SearchFiltersValue) {
    update({
      precoMin: filters.precoMin,
      precoMax: filters.precoMax,
      notaMin: filters.notaMin,
      modo: filters.modo,
      tipoPreco: filters.tipoPreco,
      raioKm: filters.raioKm,
    })
  }

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <div className="mx-auto max-w-3xl">
            <SearchBar
              variant="compact"
              navigateOnCityChange
              displayCity={city ?? null}
              defaultQuery={search.q ?? ''}
              categorySlug={search.categoria}
            />
          </div>

          <div className="mt-3">
            <CategoryCarousel
              categories={categories}
              activeSlug={search.categoria}
              search={{ q: search.q, cidadeId: search.cidadeId }}
            />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Heading variant="h1" className="text-2xl font-extrabold md:text-3xl">
              {title}
            </Heading>
            <p className="mt-1 text-sm text-muted-foreground">
              {results.metadata.total === 0
                ? 'Nenhum resultado'
                : `${results.metadata.total} ${results.metadata.total === 1 ? 'serviço encontrado' : 'serviços encontrados'}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SearchFilters
              value={{
                precoMin: search.precoMin,
                precoMax: search.precoMax,
                notaMin: search.notaMin,
                modo: search.modo,
                tipoPreco: search.tipoPreco,
                raioKm: search.raioKm,
              }}
              onApply={onApplyFilters}
              hasCoordinates={hasCoordinates}
            />
            <SortSelect
              value={search.ordenar ?? (hasCoordinates ? 'distance' : 'relevance')}
              onChange={(ordenar) => update({ ordenar })}
            />
          </div>
        </div>

        {search.q || search.categoria || search.cidadeId ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {search.q ? (
              <Link to="/buscar" search={(current) => ({ ...current, q: undefined })}>
                <Badge variant="secondary">“{search.q}” ✕</Badge>
              </Link>
            ) : null}
            {category ? (
              <Link
                to="/buscar"
                search={(current) => ({ ...current, categoria: undefined })}
              >
                <Badge variant="secondary">{category.name} ✕</Badge>
              </Link>
            ) : null}
            {cityLabel ? (
              <Link
                to="/buscar"
                search={(current) => ({
                  ...current,
                  cidadeId: undefined,
                  pagina: undefined,
                })}
              >
                <Badge variant="secondary">
                  <MapPin aria-hidden="true" className="mr-1 size-3" />
                  {cityLabel} ✕
                </Badge>
              </Link>
            ) : null}
          </div>
        ) : null}

        {results.data.length === 0 ? (
          <div className="mt-8">
            <SearchEmptyState city={cityLabel} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.data.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {results.metadata.lastPage > 1 ? (
          <div className="mt-10 flex justify-center">
            <Pagination
              page={results.metadata.currentPage}
              totalPages={results.metadata.lastPage}
              onPageChange={(pagina) =>
                navigate({
                  to: '/buscar',
                  search: (current) => ({
                    ...current,
                    pagina: pagina > 1 ? pagina : undefined,
                  }),
                })
              }
            />
          </div>
        ) : null}
      </section>
    </>
  )
}
