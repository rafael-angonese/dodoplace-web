import { Check, HandHelping, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'

import type { ServiceType } from '@/lib/services'
import { cn } from '@/utils/cn'

type ServiceTypeOption = {
  value: ServiceType
  icon: LucideIcon
  title: string
  description: string
  hint: string
}

const SERVICE_TYPE_OPTIONS: ServiceTypeOption[] = [
  {
    value: 'offer',
    icon: Wrench,
    title: 'Ofereço um serviço',
    description:
      'Divulgue o que você faz e receba contatos de clientes na sua região.',
    hint: 'Ex.: sou eletricista e instalo chuveiros',
  },
  {
    value: 'request',
    icon: HandHelping,
    title: 'Preciso de um serviço',
    description:
      'Descreva o que você precisa e deixe os profissionais entrarem em contato.',
    hint: 'Ex.: preciso de alguém para instalar meu chuveiro',
  },
]

export function ServiceTypeCards({
  value,
  onChange,
  className,
}: {
  value: ServiceType | null
  onChange: (type: ServiceType) => void
  className?: string
}) {
  const groupName = useId()

  return (
    <fieldset className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <legend className="sr-only">Tipo de anúncio</legend>

      {SERVICE_TYPE_OPTIONS.map((option) => {
        const isSelected = option.value === value
        const Icon = option.icon

        return (
          <label
            key={option.value}
            className={cn(
              'relative flex h-full cursor-pointer flex-col items-start gap-3 rounded-2xl border p-6 transition',
              'hover:-translate-y-0.5 hover:shadow-md has-focus-visible:ring-2 has-focus-visible:ring-ring',
              isSelected
                ? 'border-brand-coral bg-brand-coral/5 shadow-sm'
                : 'border-border bg-background',
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            {isSelected ? (
              <span className="absolute top-4 right-4 grid size-6 place-items-center rounded-full bg-brand-coral text-white">
                <Check aria-hidden="true" className="size-4" />
              </span>
            ) : null}

            <span
              className={cn(
                'grid size-12 place-items-center rounded-xl transition',
                isSelected
                  ? 'bg-brand-coral text-white'
                  : 'bg-surface-muted text-brand-coral',
              )}
            >
              <Icon aria-hidden="true" className="size-6" />
            </span>

            <span className="text-lg font-extrabold">{option.title}</span>
            <span className="text-sm text-muted-foreground">
              {option.description}
            </span>
            <span className="mt-auto pt-2 text-xs text-muted-foreground/80">
              {option.hint}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
