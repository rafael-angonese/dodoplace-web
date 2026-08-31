import { MapPin } from 'lucide-react'
import { useState } from 'react'

import {
  CITY_OPTIONS,
  type CityOption,
  useLocation,
} from '@/components/location/location-context'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/cn'

const UNSUPPORTED_MESSAGE =
  'A geolocalização não está disponível nesta versão. Escolha a cidade manualmente.'

export function LocationSelector({ id = 'location-city' }: { id?: string }) {
  const { location, setLocation } = useLocation()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function selectCity(option: CityOption) {
    setLocation(option)
    setMessage(null)
    setOpen(false)
  }

  return (
    <div className="grid gap-1 text-sm font-medium">
      <Label htmlFor={id}>Localização</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            aria-expanded={open}
            className={cn(
              'min-h-12 w-full justify-start border-input bg-input-bg px-4 font-normal shadow-none',
              !location && 'text-muted-foreground',
            )}
          >
            <MapPin aria-hidden="true" className="shrink-0" />
            {location ? `${location.city}, ${location.state}` : 'Cidade'}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Buscar cidade..." />
            <CommandList>
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
              <CommandGroup>
                {CITY_OPTIONS.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.city} ${option.state}`}
                    onSelect={() => selectCity(option)}
                  >
                    {option.city}, {option.state}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={() => setMessage(UNSUPPORTED_MESSAGE)}
        className="text-left text-xs font-semibold text-muted-foreground underline"
      >
        Usar minha localização
      </button>

      {message ? (
        <output className="text-xs text-muted-foreground">{message}</output>
      ) : null}
    </div>
  )
}
