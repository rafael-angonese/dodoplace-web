import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { type City, locationsApi } from '@/lib/locations'

const STORAGE_KEY = 'dodoplace.location.city'

export type GeolocationStatus =
  | 'idle'
  | 'locating'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'failed'

type LocationContextValue = {
  city: City | null
  setCity: (city: City | null) => void
  geolocationStatus: GeolocationStatus
  detectCity: () => Promise<City | null>
}

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined,
)

function readStoredCity(): City | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as City) : null
  } catch {
    return null
  }
}

function writeStoredCity(city: City | null) {
  try {
    if (city) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(city))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}

function currentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    })
  })
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City | null>(null)
  const [geolocationStatus, setGeolocationStatus] =
    useState<GeolocationStatus>('idle')

  useEffect(() => {
    setCityState(readStoredCity())
  }, [])

  const setCity = useCallback((next: City | null) => {
    setCityState(next)
    writeStoredCity(next)
  }, [])

  const detectCity = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeolocationStatus('unsupported')
      return null
    }

    setGeolocationStatus('locating')

    try {
      const position = await currentPosition()

      const [nearest] = await locationsApi.nearby({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        limit: 1,
      })

      if (!nearest) {
        setGeolocationStatus('failed')
        return null
      }

      setGeolocationStatus('granted')
      setCity(nearest)

      return nearest
    } catch (error) {
      const denied =
        typeof GeolocationPositionError !== 'undefined' &&
        error instanceof GeolocationPositionError &&
        error.code === error.PERMISSION_DENIED

      setGeolocationStatus(denied ? 'denied' : 'failed')

      return null
    }
  }, [setCity])

  const value = useMemo<LocationContextValue>(
    () => ({ city, setCity, geolocationStatus, detectCity }),
    [city, setCity, geolocationStatus, detectCity],
  )

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)

  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }

  return context
}
