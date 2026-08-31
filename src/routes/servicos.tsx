import { createFileRoute } from '@tanstack/react-router'

import { CATEGORIES } from '@/components/discovery/categories'
import { CategoryGrid } from '@/components/discovery/category-grid'
import { Heading } from '@/components/ui/heading'

export const Route = createFileRoute('/servicos')({
  component: Servicos,
  head: () => ({ meta: [{ title: 'Serviços | FazPerto' }] }),
})

function Servicos() {
  const categories = CATEGORIES.slice(0, 24)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Serviços
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Explore categorias de serviços disponíveis no FazPerto.
      </p>

      <div className="mt-7">
        <CategoryGrid categories={categories} />
      </div>

      <div className="mt-8 rounded-2xl bg-surface-muted p-6 text-muted-foreground">
        Os anúncios de serviços aparecerão aqui conforme profissionais
        publicarem suas ofertas.
      </div>
    </section>
  )
}
