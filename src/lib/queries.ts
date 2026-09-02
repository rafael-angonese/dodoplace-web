import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query'

import { categoriesApi } from '@/lib/categories'
import { locationsApi } from '@/lib/locations'
import { type SearchServicesParams, servicesApi } from '@/lib/services'

export const SERVICES_PAGE_SIZE = 24

export const categoriesQueryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: ({ signal }) => categoriesApi.list(signal),
  staleTime: 10 * 60_000,
})

export function cityQueryOptions(cityId: number) {
  return queryOptions({
    queryKey: ['city', cityId],
    queryFn: ({ signal }) => locationsApi.city(cityId, signal),
    staleTime: 10 * 60_000,
  })
}

export function serviceListQueryOptions(params: SearchServicesParams) {
  return infiniteQueryOptions({
    queryKey: ['services', params],
    queryFn: ({ pageParam, signal }) =>
      servicesApi.search(
        {
          ...params,
          cursor: pageParam ?? undefined,
          porPagina: SERVICES_PAGE_SIZE,
        },
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })
}
