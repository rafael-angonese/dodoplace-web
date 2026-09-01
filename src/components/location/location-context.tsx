import { createContext, useContext, useMemo, useState } from 'react'

export type CityOption = {
  id: string
  city: string
  state: string
}

export const CITY_OPTIONS: CityOption[] = [
  { id: 'chapeco-sc', city: 'Chapecó', state: 'SC' },
  { id: 'florianopolis-sc', city: 'Florianópolis', state: 'SC' },
  { id: 'curitiba-pr', city: 'Curitiba', state: 'PR' },
  { id: 'sao-paulo-sp', city: 'São Paulo', state: 'SP' },
  { id: 'porto-alegre-rs', city: 'Porto Alegre', state: 'RS' },
]

type LocationState = {
  location: CityOption | null
  setLocation: (location: CityOption | null) => void
}

const LocationContext = createContext<LocationState | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<CityOption | null>(null)

  const value = useMemo(() => ({ location, setLocation }), [location])

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
