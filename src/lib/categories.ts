import { apiRequest } from '@/lib/api'

export type ServiceCategory = {
  id: number
  slug: string
  name: string
  icon: string
  description: string | null
  position: number
}

export const categoriesApi = {
  list(signal?: AbortSignal) {
    return apiRequest<ServiceCategory[]>('/categories', { signal })
  },
}
