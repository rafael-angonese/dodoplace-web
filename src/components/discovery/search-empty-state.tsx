import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'

export function SearchEmptyState({ city }: { city?: string | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <Heading variant="h4">
        Ainda não encontramos resultados{city ? ` em ${city}` : ''}.
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Tente alterar a busca ou publique o serviço que você precisa.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/">Alterar busca</Link>
        </Button>
        <Button asChild>
          <a href="/publish">Publicar anúncio</a>
        </Button>
      </div>
    </div>
  )
}
