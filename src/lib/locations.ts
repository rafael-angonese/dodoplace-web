import { apiRequest, toQueryString } from '@/lib/api'

export type City = {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
  stateAcronym: string | null
  stateName: string | null
  label: string
  distanceKm: number | null
}

export type State = {
  id: number
  acronym: string
  name: string
  regionName: string
}

export const locationsApi = {
  states(signal?: AbortSignal) {
    return apiRequest<State[]>('/locations/states', { signal })
  },

  cities(
    params: { q?: string; state?: string; limit?: number },
    signal?: AbortSignal,
  ) {
    return apiRequest<City[]>(`/locations/cities${toQueryString(params)}`, {
      signal,
    })
  },

  city(id: number, signal?: AbortSignal) {
    return apiRequest<City>(`/locations/cities/${id}`, { signal })
  },

  nearby(
    params: { latitude: number; longitude: number; limit?: number },
    signal?: AbortSignal,
  ) {
    return apiRequest<City[]>(
      `/locations/cities/nearby${toQueryString(params)}`,
      { signal },
    )
  },
}
