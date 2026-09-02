import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState } from 'react'

import { useLocation } from '@/components/location/location-context'
import { LocationPicker } from '@/components/location/location-picker'
import type { City } from '@/lib/locations'
import { cn } from '@/utils/cn'

export function SearchBar({
  defaultQuery = '',
  categorySlug,
  variant = 'hero',
  navigateOnCityChange = false,
  displayCity,
}: {
  defaultQuery?: string
  categorySlug?: string
  variant?: 'hero' | 'compact'
  navigateOnCityChange?: boolean
  displayCity?: City | null
}) {
  const navigate = useNavigate()
  const { city: storedCity } = useLocation()
  const city = displayCity === undefined ? storedCity : displayCity
  const [query, setQuery] = useState(defaultQuery)

  function submit(event: React.FormEvent) {
    event.preventDefault()

    navigate({
      to: '/buscar',
      search: {
        q: query.trim() || undefined,
        categoria: categorySlug,
        cidadeId: city?.id,
      },
    })
  }

  function onCitySelect(next: City | null) {
    if (!navigateOnCityChange) {
      return
    }

    navigate({
      to: '/buscar',
      search: (current) => ({
        ...current,
        cidadeId: next?.id,
        pagina: undefined,
      }),
    })
  }

  const isCompact = variant === 'compact'

  return (
    <form
      onSubmit={submit}
      className={cn(
        'flex items-center gap-1 rounded-full border border-border bg-card shadow-sm transition-shadow hover:shadow-md',
        isCompact ? 'p-1' : 'flex-col gap-2 p-2 md:flex-row md:gap-1',
      )}
    >
      <label
        className={cn(
          'flex w-full min-w-0 flex-col justify-center rounded-full px-5 py-2 hover:bg-accent/50',
          isCompact && 'py-1.5',
        )}
      >
        <span
          className={cn(
            'text-[11px] font-bold tracking-wide',
            isCompact && 'sr-only',
          )}
        >
          O que você precisa
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Eletricista, diarista, encanador..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <span
        aria-hidden="true"
        className="hidden h-8 w-px shrink-0 bg-border md:block"
      />

      <div
        className={cn(
          'w-full min-w-0 rounded-full hover:bg-accent/50 md:w-72',
          isCompact ? 'md:w-56' : '',
        )}
      >
        <div className="flex flex-col justify-center px-2">
          <span
            className={cn(
              'px-2 text-[11px] font-bold tracking-wide',
              isCompact && 'sr-only',
            )}
          >
            Onde
          </span>
          <LocationPicker
            onSelect={onCitySelect}
            displayCity={displayCity}
            triggerClassName={cn('min-h-0 px-2 py-1', isCompact && 'py-1.5')}
          />
        </div>
      </div>

      <button
        type="submit"
        className="ml-auto grid size-11 shrink-0 place-items-center rounded-full bg-brand-coral text-white transition hover:brightness-95"
        aria-label="Buscar serviços"
      >
        <Search aria-hidden="true" className="size-4" />
      </button>
    </form>
  )
}
