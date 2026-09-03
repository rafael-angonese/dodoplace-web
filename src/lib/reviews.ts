import {
  type Paginated,
  apiPaginated,
  apiRequest,
  toQueryString,
} from '@/lib/api'
import type { UserSummary } from '@/lib/services'

export type UserReview = {
  id: number
  rating: number
  comment: string | null
  userId: number
  authorId: number
  author?: UserSummary
  createdAt: string
  updatedAt: string | null
}

export type ReviewInput = {
  rating: number
  comment: string | null
}

export const reviewsApi = {
  list(
    userId: number,
    params: { page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<UserReview>> {
    return apiPaginated<UserReview>(
      `/profiles/${userId}/reviews${toQueryString(params)}`,
      { signal },
    )
  },

  save(token: string, userId: number, input: ReviewInput) {
    return apiRequest<UserReview>(`/profiles/${userId}/reviews`, {
      method: 'POST',
      body: input,
      token,
    })
  },

  remove(token: string, userId: number) {
    return apiRequest<void>(`/profiles/${userId}/reviews`, {
      method: 'DELETE',
      token,
    })
  },
}
