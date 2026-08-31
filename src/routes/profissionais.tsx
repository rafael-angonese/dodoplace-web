import { createFileRoute } from '@tanstack/react-router'

import { SearchForm } from '@/components/discovery/search-form'
import { Heading } from '@/components/ui/heading'

export const Route = createFileRoute('/profissionais')({
  component: Profissionais,
  head: () => ({ meta: [{ title: 'Profissionais | FazPerto' }] }),
})

function Profissionais() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Profissionais perto de você
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Encontre profissionais por serviço e localização.
      </p>

      <div className="mt-6">
        <SearchForm />
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Ainda não há perfis profissionais publicados nesta versão do
        marketplace.
      </div>
    </section>
  )
}
