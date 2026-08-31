import { createFileRoute } from '@tanstack/react-router'

import { categoryLabel } from '@/components/discovery/categories'
import { SearchEmptyState } from '@/components/discovery/search-empty-state'
import { SearchForm } from '@/components/discovery/search-form'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type BuscarSearch = {
  q?: string
  categoria?: string
  cidade?: string
  uf?: string
}

function text(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export const Route = createFileRoute('/buscar')({
  component: Buscar,
  head: () => ({ meta: [{ title: 'Buscar serviços | FazPerto' }] }),
  validateSearch: (search: Record<string, unknown>): BuscarSearch => {
    const categoria = text(search.categoria)
    const uf = text(search.uf)?.toUpperCase()

    return {
      q: text(search.q),
      categoria:
        categoria && SLUG_PATTERN.test(categoria) ? categoria : undefined,
      cidade: text(search.cidade),
      uf: uf && /^[A-Z]{2}$/.test(uf) ? uf : undefined,
    }
  },
})

const FILTERS = ['Distância', 'Avaliação', 'Disponibilidade']

function Buscar() {
  const { q, categoria, cidade } = Route.useSearch()

  const title =
    categoria && cidade
      ? `${categoryLabel(categoria)} em ${cidade}`
      : 'Encontre serviços perto de você'

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Heading
        variant="h1"
        className="text-3xl font-extrabold md:text-4xl"
      >
        {title}
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Busque profissionais e serviços com prioridade para sua região.
      </p>

      <div className="mt-6">
        <SearchForm defaultQuery={q ?? ''} category={categoria} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-2xl border border-border p-5">
          <Heading variant="h5">Filtros</Heading>

          <div className="mt-4 space-y-4">
            {FILTERS.map((name) => (
              <div key={name}>
                <Button
                  variant="outline"
                  fullWidth
                  disabled
                  className="justify-start font-semibold"
                >
                  {name}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  Disponível quando houver serviços publicados
                </p>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            fullWidth
            disabled
            aria-disabled="true"
            className="mt-5 font-semibold"
          >
            Ver mapa
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            Mapa disponível com resultados
          </p>
        </aside>

        <div>
          <SearchEmptyState city={cidade} />
        </div>
      </div>
    </section>
  )
}
