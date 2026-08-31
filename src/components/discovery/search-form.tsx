import { useNavigate } from '@tanstack/react-router'
import type { FormEvent } from 'react'

import { LocationSelector } from '@/components/location/location-selector'
import { useLocation } from '@/components/location/location-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SearchForm({
  defaultQuery = '',
  category,
}: {
  defaultQuery?: string
  category?: string
}) {
  const navigate = useNavigate()
  const { location } = useLocation()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const q = String(form.get('q') ?? '').trim()

    navigate({
      to: '/buscar',
      search: {
        ...(q ? { q } : {}),
        ...(category ? { categoria: category } : {}),
        ...(location ? { cidade: location.city, uf: location.state } : {}),
      },
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:grid-cols-[1fr_280px_auto]"
    >
      <div className="grid gap-1 text-sm font-medium">
        <Label htmlFor="search-q">O que você precisa?</Label>
        <Input
          id="search-q"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Ex.: pintor, eletricista, montagem..."
          className="min-h-12 text-base"
        />
      </div>

      <LocationSelector />

      <Button type="submit" className="min-h-12 self-end px-5 font-bold">
        Encontrar profissional
      </Button>
    </form>
  )
}
