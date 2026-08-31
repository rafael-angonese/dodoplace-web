import { createFileRoute } from '@tanstack/react-router'

import { Heading } from '@/components/ui/heading'

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({ meta: [{ title: 'Sobre | FazPerto' }] }),
})

function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="mb-3 text-sm font-bold tracking-[0.18em] text-brand-coral uppercase">
        Sobre
      </p>
      <Heading variant="h1" className="text-3xl font-extrabold md:text-4xl">
        Um marketplace para resolver o que precisa ser feito.
      </Heading>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        O FazPerto conecta quem precisa de um serviço a profissionais da mesma
        região, priorizando proximidade e transparência antes da contratação.
      </p>
    </section>
  )
}
