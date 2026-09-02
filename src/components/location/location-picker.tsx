import { Loader2, MapPin, Navigation } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useLocation } from '@/components/location/location-context'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type City, locationsApi } from '@/lib/locations'
import { cn } from '@/utils/cn'

const GEOLOCATION_MESSAGE: Record<string, string> = {
  denied: 'Permissão de localização negada. Escolha a cidade na lista.',
  unsupported: 'Seu navegador não oferece geolocalização.',
  failed: 'Não conseguimos detectar sua localização. Tente escolher na lista.',
}

export function LocationPicker({
  onSelect,
  triggerClassName,
  placeholder = 'Qualquer lugar',
  displayCity,
}: {
  onSelect?: (city: City | null) => void
  triggerClassName?: string
  placeholder?: string
  displayCity?: City | null
}) {
  const { city: storedCity, setCity, geolocationStatus, detectCity } = useLocation()
  const city = displayCity === undefined ? storedCity : displayCity
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!open) {
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      locationsApi
        .cities({ q: term.trim() || undefined, limit: 20 }, controller.signal)
        .then(setCities)
        .catch(() => undefined)
        .finally(() => setIsLoading(false))
    }, 220)

    return () => {
      controller.abort()
      clearTimeout(debounce.current)
    }
  }, [open, term])

  function choose(next: City | null) {
    setCity(next)
    onSelect?.(next)
    setOpen(false)
  }

  async function onDetect() {
    const detected = await detectCity()

    if (detected) {
      onSelect?.(detected)
      setOpen(false)
    }
  }

  const message = GEOLOCATION_MESSAGE[geolocationStatus]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            'flex min-h-12 w-full items-center gap-2 px-4 text-left text-sm',
            triggerClassName,
          )}
        >
          <MapPin aria-hidden="true" className="size-4 shrink-0" />
          <span
            className={cn('truncate', !city && 'text-muted-foreground')}
          >
            {city ? city.label : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar cidade..."
            value={term}
            onValueChange={setTerm}
          />

          <CommandList>
            <CommandGroup heading="Destinos sugeridos">
              <CommandItem
                value="__geolocation"
                onSelect={onDetect}
                className="gap-3"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted">
                  {geolocationStatus === 'locating' ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <Navigation aria-hidden="true" className="size-4" />
                  )}
                </span>
                <span>
                  <span className="block font-semibold">Perto de você</span>
                  <span className="block text-xs text-muted-foreground">
                    Usar a localização do dispositivo
                  </span>
                </span>
              </CommandItem>

              {city ? (
                <CommandItem
                  value="__clear"
                  onSelect={() => choose(null)}
                  className="gap-3 text-muted-foreground"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted">
                    <MapPin aria-hidden="true" className="size-4" />
                  </span>
                  Qualquer lugar do Brasil
                </CommandItem>
              ) : null}
            </CommandGroup>

            {message ? (
              <p className="px-3 pb-2 text-xs text-danger">{message}</p>
            ) : null}

            <CommandGroup heading="Cidades">
              {isLoading && cities.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Buscando...
                </p>
              ) : null}

              {cities.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.id}`}
                  onSelect={() => choose(option)}
                  className="gap-3"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted">
                    <MapPin aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <span className="block font-medium">{option.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {option.stateName}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            {!isLoading && cities.length === 0 ? (
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
