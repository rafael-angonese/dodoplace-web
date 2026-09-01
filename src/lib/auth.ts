import { apiRequest } from '@/lib/api'

export type User = {
  id: number
  name: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string | null
}

export type AuthSession = {
  user: User
  token: string
}

export type MagicLinkInput = {
  email: string
  name?: string | null
}

export type MagicLinkResult = {
  message: string
  expiresInMinutes: number
  devUrl?: string
}

export const authApi = {
  requestMagicLink(input: MagicLinkInput, signal?: AbortSignal) {
    return apiRequest<MagicLinkResult>('/auth/magic-link', {
      method: 'POST',
      body: input,
      signal,
    })
  },

  verifyMagicLink(token: string, signal?: AbortSignal) {
    return apiRequest<AuthSession>('/auth/verify', {
      method: 'POST',
      body: { token },
      signal,
    })
  },

  signOut(token: string) {
    return apiRequest<{ message: string }>('/account/logout', {
      method: 'POST',
      token,
    })
  },

  profile(token: string, signal?: AbortSignal) {
    return apiRequest<User>('/account/profile', { token, signal })
  },

  updateProfile(token: string, input: { name: string | null }) {
    return apiRequest<User>('/account/profile', {
      method: 'PUT',
      body: input,
      token,
    })
  },
}
