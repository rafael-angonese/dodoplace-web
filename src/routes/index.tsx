import { Link, createFileRoute } from '@tanstack/react-router'

import { CATEGORIES } from '@/components/discovery/categories'
import { CategoryGrid } from '@/components/discovery/category-grid'
import { SearchForm } from '@/components/discovery/search-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: 'FazPerto | Serviços perto de você' },
      {
        name: 'description',
        content:
          'Encontre quem faz perto de você. Descubra profissionais e serviços na sua região.',
      },
    ],
  }),
})

const STEPS = [
  {
    number: '1',
    title: 'Descreva',
    description: 'Conte o que precisa ser feito, seu orçamento e sua região.',
  },
  {
    number: '2',
    title: 'Compare',
    description: 'Veja profissionais, propostas e reputação antes de decidir.',
  },
  {
    number: '3',
    title: 'Combine',
    description:
      'Converse com o profissional e alinhe os detalhes diretamente.',
  },
]

function Home() {
  const categories = CATEGORIES.slice(0, 12)

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <p className="mb-3 text-sm font-bold tracking-[0.18em] text-brand-coral uppercase">
          Marketplace de serviços
        </p>
        <Heading
          variant="h1"
          className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl"
        >
          Encontre quem faz perto de você. ⚡
        </Heading>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Busque serviços e profissionais da sua região ou publique o que você
          precisa fazer.
        </p>
        <div className="mt-8">
          <SearchForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-coral">Descubra</p>
            <Heading variant="h2" className="font-extrabold">
              Serviços populares
            </Heading>
          </div>
          <Link to="/servicos" className="text-sm font-bold underline">
            Ver todos
          </Link>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      <section className="bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <Heading variant="h2" className="font-extrabold">
            Resolver um serviço deve ser simples.
          </Heading>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <Card key={step.number} className="rounded-2xl p-6">
                <span className="grid size-9 place-items-center rounded-full bg-brand-yellow font-extrabold text-[#202124]">
                  {step.number}
                </span>
                <Heading variant="h4" className="mt-4">
                  {step.title}
                </Heading>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-2 md:px-6">
        <div className="rounded-3xl border border-border p-7">
          <Heading variant="h2" className="font-extrabold">
            Precisa de um serviço?
          </Heading>
          <p className="mt-2 text-muted-foreground">
            Pesquise profissionais próximos ou publique o que precisa.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/buscar">Buscar</Link>
            </Button>
            {/* Rota de publicação ainda não implementada. */}
            <Button asChild>
              <a href="/publicar">Publicar serviço</a>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-[#202124] p-7 text-white dark:bg-card dark:text-card-foreground">
          <Heading variant="h2" className="font-extrabold text-white dark:text-card-foreground">
            Você presta serviços?
          </Heading>
          <p className="mt-2 text-white/70 dark:text-muted-foreground">
            Crie seu perfil e prepare sua presença para aparecer perto de novos
            clientes.
          </p>
          {/* Rota de cadastro profissional ainda não implementada. */}
          <Button asChild className="mt-5">
            <a href="/oferecer-servico">Começar como profissional</a>
          </Button>
        </div>
      </section>
    </>
  )
}
