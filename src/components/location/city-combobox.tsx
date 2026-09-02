import { Check, ChevronsUpDown, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
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

export function CityCombobox({
  value,
  onChange,
  id,
  placeholder = 'Escolha a cidade',
}: {
  value: City | null
  onChange: (city: City | null) => void
  id?: string
  placeholder?: string
}) {
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
        .cities({ q: term.trim() || undefined, limit: 25 }, controller.signal)
        .then(setCities)
        .catch(() => undefined)
        .finally(() => setIsLoading(false))
    }, 220)

    return () => {
      controller.abort()
      clearTimeout(debounce.current)
    }
  }, [open, term])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          aria-expanded={open}
          className={cn(
            'w-full justify-between border-input bg-input-bg font-normal shadow-none',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin aria-hidden="true" className="shrink-0" />
            <span className="truncate">{value ? value.label : placeholder}</span>
          </span>
          <ChevronsUpDown aria-hidden="true" className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar cidade..."
            value={term}
            onValueChange={setTerm}
          />
          <CommandList>
            {isLoading && cities.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Buscando...
              </p>
            ) : null}

            <CommandGroup>
              {cities.map((option) => (
                <CommandItem
                  key={option.id}
                  value={String(option.id)}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  <Check
                    aria-hidden="true"
                    className={cn(
                      'mr-2 size-4',
                      value?.id === option.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span>
                    <span className="block">{option.name}</span>
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
