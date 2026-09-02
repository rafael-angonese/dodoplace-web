import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

type FavoritesContextValue = {
  ids: ReadonlySet<number>
  isFavorited: (serviceId: number) => boolean
  toggle: (serviceId: number) => Promise<boolean>
  isReady: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status, token } = useAuth()
  const [ids, setIds] = useState<ReadonlySet<number>>(new Set())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setIds(new Set())
      setIsReady(status === 'unauthenticated')
      return
    }

    const controller = new AbortController()

    servicesApi
      .favoriteIds(token, controller.signal)
      .then((list) => {
        setIds(new Set(list))
        setIsReady(true)
      })
      .catch(() => setIsReady(true))

    return () => controller.abort()
  }, [status, token])

  const toggle = useCallback(
    async (serviceId: number) => {
      if (!token) {
        throw new Error('toggle requires an authenticated session')
      }

      const next = !ids.has(serviceId)

      setIds((current) => {
        const updated = new Set(current)

        if (next) {
          updated.add(serviceId)
        } else {
          updated.delete(serviceId)
        }

        return updated
      })

      try {
        if (next) {
          await servicesApi.favorite(token, serviceId)
        } else {
          await servicesApi.unfavorite(token, serviceId)
        }
      } catch (error) {
        setIds((current) => {
          const updated = new Set(current)

          if (next) {
            updated.delete(serviceId)
          } else {
            updated.add(serviceId)
          }

          return updated
        })

        throw error
      }

      return next
    },
    [ids, token],
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids,
      isFavorited: (serviceId: number) => ids.has(serviceId),
      toggle,
      isReady,
    }),
    [ids, toggle, isReady],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }

  return context
}
