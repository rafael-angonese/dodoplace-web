import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ApiError } from '@/lib/api'
import {
  type MagicLinkInput,
  type MagicLinkResult,
  type User,
  authApi,
} from '@/lib/auth'
import { authStorage } from '@/lib/auth-storage'

/**
 * `loading` cobre o SSR e o primeiro render do cliente, antes de sabermos se
 * existe token no localStorage. Sem isso o HTML do servidor divergiria do
 * cliente na hidratação.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  token: string | null
  /** Pede um link de acesso por e-mail. Não abre sessão por si só. */
  requestMagicLink: (input: MagicLinkInput) => Promise<MagicLinkResult>
  /** Troca o token do link por uma sessão. */
  verifyMagicLink: (token: string) => Promise<User>
  signOut: () => Promise<void>
  updateProfile: (input: { name: string | null }) => Promise<User>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Restaura a sessão a partir do token guardado (client-only).
  useEffect(() => {
    const stored = authStorage.get()

    if (!stored) {
      setStatus('unauthenticated')
      return
    }

    const controller = new AbortController()

    authApi
      .profile(stored, controller.signal)
      .then((profile) => {
        setUser(profile)
        setToken(stored)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        // Token expirado ou revogado: descarta e segue como visitante.
        if (error instanceof ApiError && error.status === 401) {
          authStorage.clear()
        }

        setStatus('unauthenticated')
      })

    return () => controller.abort()
  }, [])

  const startSession = useCallback((session: { user: User; token: string }) => {
    authStorage.set(session.token)
    setToken(session.token)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [])

  const requestMagicLink = useCallback(
    (input: MagicLinkInput) => authApi.requestMagicLink(input),
    [],
  )

  const verifyMagicLink = useCallback(
    async (magicToken: string) =>
      startSession(await authApi.verifyMagicLink(magicToken)),
    [startSession],
  )

  const signOut = useCallback(async () => {
    if (token) {
      // Revogar o token no servidor é best-effort: a sessão local cai de todo jeito.
      await authApi.signOut(token).catch(() => undefined)
    }

    authStorage.clear()
    setToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [token])

  const updateProfile = useCallback(
    async (input: { name: string | null }) => {
      if (!token) {
        throw new Error('updateProfile requires an authenticated session')
      }

      const updated = await authApi.updateProfile(token, input)
      setUser(updated)
      return updated
    },
    [token],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      requestMagicLink,
      verifyMagicLink,
      signOut,
      updateProfile,
    }),
    [
      status,
      user,
      token,
      requestMagicLink,
      verifyMagicLink,
      signOut,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
