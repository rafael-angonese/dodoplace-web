import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'

export function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <p className="mb-3 text-sm font-bold tracking-[0.18em] text-brand-coral uppercase">
        Erro 404
      </p>
      <Heading variant="h1" className="text-3xl font-extrabold md:text-4xl">
        Essa página não existe.
      </Heading>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        O endereço pode ter mudado ou a página ainda não foi publicada.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/">Voltar para o início</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Buscar serviços</Link>
        </Button>
      </div>
    </section>
  )
}
