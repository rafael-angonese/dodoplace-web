import type { ServiceType } from '@/lib/services'
import { cn } from '@/utils/cn'

const OPTIONS: { value: ServiceType | undefined; label: string }[] = [
  { value: undefined, label: 'Tudo' },
  { value: 'offer', label: 'Oferecendo' },
  { value: 'request', label: 'Procurando' },
]

export function ServiceTypeTabs({
  value,
  onChange,
  className,
}: {
  value: ServiceType | undefined
  onChange: (value: ServiceType | undefined) => void
  className?: string
}) {
  return (
    <fieldset
      className={cn(
        'inline-flex h-10 items-center rounded-full border border-border bg-background p-1',
        className,
      )}
    >
      <legend className="sr-only">Tipo de anúncio</legend>

      {OPTIONS.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-8 rounded-full px-4 text-sm font-semibold transition',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </fieldset>
  )
}
