import {
  type CursorPage,
  type Paginated,
  apiCursorPage,
  apiPaginated,
  apiRequest,
  toQueryString,
} from '@/lib/api'
import type { ServiceCategory } from '@/lib/categories'
import type { City } from '@/lib/locations'

export type PriceType = 'hourly' | 'daily' | 'fixed' | 'quote'

export type ServiceMode = 'at_client' | 'at_provider' | 'remote'

export type ServiceStatus = 'draft' | 'published' | 'archived'

export type ServiceSort =
  | 'relevance'
  | 'distance'
  | 'rating'
  | 'price_asc'
  | 'price_desc'
  | 'recent'

export type ServiceMediaKind = 'image' | 'video'

export const SERVICE_MEDIA_MAX_COUNT = 10

export const SERVICE_PHOTO_MAX_BYTES = 8 * 1024 * 1024

export const SERVICE_VIDEO_MAX_BYTES = 60 * 1024 * 1024

export const SERVICE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const SERVICE_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v']

export type ServicePhoto = {
  id: number
  kind: ServiceMediaKind
  url: string | null
  position: number
}

export type ServiceProvider = {
  id: number
  name: string | null
  avatarUrl: string | null
  initials: string
  headline: string | null
  createdAt: string
}

export type Service = {
  id: number
  title: string
  description: string
  priceType: PriceType
  priceCents: number | null
  serviceMode: ServiceMode
  coverageRadiusKm: number | null
  neighborhood: string | null
  status: ServiceStatus
  ratingAverage: number
  reviewsCount: number
  favoritesCount: number
  distanceKm: number | null
  isFavorited: boolean
  categoryId: number
  cityId: number
  userId: number
  category?: ServiceCategory
  city?: City
  photos?: ServicePhoto[]
  provider?: ServiceProvider
  publishedAt: string | null
  createdAt: string
  updatedAt: string | null
}

export type ServiceReview = {
  id: number
  rating: number
  comment: string | null
  serviceId: number
  userId: number
  author?: ServiceProvider
  createdAt: string
  updatedAt: string | null
}

export type PublicProfile = {
  id: number
  name: string | null
  avatarUrl: string | null
  initials: string
  headline: string | null
  bio: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  city?: City
  services?: Service[]
  createdAt: string
}

export function serviceCover(service: Service) {
  return service.photos?.find((photo) => photo.kind === 'image') ?? null
}

export type SearchServicesParams = {
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
  cursor?: string
  perPage?: number
}

export type ServiceInput = {
  title: string
  description: string
  categoryId: number
  cityId: number
  priceType: PriceType
  priceCents: number | null
  serviceMode: ServiceMode
  coverageRadiusKm: number | null
  neighborhood: string | null
}

export const servicesApi = {
  search(
    params: SearchServicesParams,
    options: { token?: string | null; signal?: AbortSignal } = {},
  ): Promise<CursorPage<Service>> {
    return apiCursorPage<Service>(`/services${toQueryString(params)}`, options)
  },

  show(
    id: number,
    options: { token?: string | null; signal?: AbortSignal } = {},
  ) {
    return apiRequest<Service>(`/services/${id}`, options)
  },

  profile(id: number, signal?: AbortSignal) {
    return apiRequest<PublicProfile>(`/profiles/${id}`, { signal })
  },

  reviews(
    id: number,
    params: { page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<ServiceReview>> {
    return apiPaginated<ServiceReview>(
      `/services/${id}/reviews${toQueryString(params)}`,
      { signal },
    )
  },

  create(token: string, input: ServiceInput & { publish?: boolean }) {
    return apiRequest<Service>('/services', {
      method: 'POST',
      body: input,
      token,
    })
  },

  update(token: string, id: number, input: Partial<ServiceInput> & { status?: ServiceStatus }) {
    return apiRequest<Service>(`/services/${id}`, {
      method: 'PUT',
      body: input,
      token,
    })
  },

  destroy(token: string, id: number) {
    return apiRequest<void>(`/services/${id}`, { method: 'DELETE', token })
  },

  addPhoto(token: string, id: number, file: File) {
    const body = new FormData()
    body.append('photo', file)

    return apiRequest<ServicePhoto>(`/services/${id}/photos`, {
      method: 'POST',
      body,
      token,
    })
  },

  reorderPhotos(token: string, id: number, photoIds: number[]) {
    return apiRequest<ServicePhoto[]>(`/services/${id}/photos`, {
      method: 'PUT',
      body: { photoIds },
      token,
    })
  },

  removePhoto(token: string, id: number, photoId: number) {
    return apiRequest<void>(`/services/${id}/photos/${photoId}`, {
      method: 'DELETE',
      token,
    })
  },

  favorite(token: string, id: number) {
    return apiRequest<Service>(`/services/${id}/favorite`, {
      method: 'POST',
      token,
    })
  },

  unfavorite(token: string, id: number) {
    return apiRequest<Service>(`/services/${id}/favorite`, {
      method: 'DELETE',
      token,
    })
  },

  saveReview(
    token: string,
    id: number,
    input: { rating: number; comment: string | null },
  ) {
    return apiRequest<ServiceReview>(`/services/${id}/reviews`, {
      method: 'POST',
      body: input,
      token,
    })
  },

  removeReview(token: string, id: number) {
    return apiRequest<void>(`/services/${id}/reviews`, {
      method: 'DELETE',
      token,
    })
  },

  mine(
    token: string,
    params: { status?: ServiceStatus; page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<Service>> {
    return apiPaginated<Service>(`/account/services${toQueryString(params)}`, {
      token,
      signal,
    })
  },

  favorites(
    token: string,
    params: { page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<Service>> {
    return apiPaginated<Service>(`/account/favorites${toQueryString(params)}`, {
      token,
      signal,
    })
  },

  favoriteIds(token: string, signal?: AbortSignal) {
    return apiRequest<number[]>('/account/favorites/ids', { token, signal })
  },
}
