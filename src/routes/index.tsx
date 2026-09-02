import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { CarouselRow } from '@/components/discovery/carousel-row'
import { CategoryCarousel } from '@/components/discovery/category-carousel'
import { SearchBar } from '@/components/discovery/search-bar'
import {
  ServiceCard,
  ServiceCardSkeleton,
} from '@/components/discovery/service-card'
import { useLocation } from '@/components/location/location-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { categoriesApi } from '@/lib/categories'
import { type HomeSection, servicesApi } from '@/lib/services'

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
  loader: async () => {
    const [categories, sections] = await Promise.all([
      categoriesApi.list(),
      servicesApi.homeFeed({}),
    ])

    return { categories, sections }
  },
})

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6']

const STEPS = [
  {
    number: '1',
    title: 'Busque perto',
    description:
      'Escolha sua cidade ou use a localização do celular para ver quem atende na sua região.',
  },
  {
    number: '2',
    title: 'Compare',
    description:
      'Veja fotos, preços, avaliações e comentários de quem já contratou.',
  },
  {
    number: '3',
    title: 'Fale direto',
    description:
      'Chame o profissional no WhatsApp e combine o serviço sem intermediário.',
  },
]

function useCityFeed(initial: HomeSection[]) {
  const { city } = useLocation()
  const [sections, setSections] = useState(initial)
  const [isLoading, setIsLoading] = useState(false)
  const [isFiltered, setIsFiltered] = useState(false)

  useEffect(() => {
    if (!city) {
      setSections(initial)
      setIsFiltered(false)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    servicesApi
      .homeFeed({ cidadeId: city.id }, { signal: controller.signal })
      .then((next) => {
        setSections(next.length > 0 ? next : initial)
        setIsFiltered(next.length > 0)
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [city, initial])

  return { sections, isLoading, isFiltered }
}

function Home() {
  const { categories, sections: initialSections } = Route.useLoaderData()
  const { city } = useLocation()
  const { sections, isLoading, isFiltered } = useCityFeed(initialSections)

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 md:pt-16">
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
          Diaristas, eletricistas, encanadores, pintores e muito mais — com
          preço, foto e avaliação de quem já contratou.
        </p>

        <div className="mt-8 max-w-3xl">
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-b border-border px-4 md:px-6">
        <CategoryCarousel categories={categories} />
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-6">
        {isLoading ? (
          <CarouselRow
            header={
              <Heading variant="h3" className="font-extrabold">
                Carregando serviços...
              </Heading>
            }
          >
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="w-[46%] shrink-0 sm:w-[30%] lg:w-[15.5%]"
              >
                <ServiceCardSkeleton />
              </div>
            ))}
          </CarouselRow>
        ) : null}

        {!isLoading && sections.length === 0 ? (
          <Card className="rounded-2xl p-8 text-center">
            <Heading variant="h4">
              Ainda não há serviços publicados por aqui.
            </Heading>
            <p className="mt-2 text-muted-foreground">
              Seja o primeiro a anunciar na sua cidade.
            </p>
            <Button asChild className="mt-5">
              <Link to="/publicar">Publicar meu serviço</Link>
            </Button>
          </Card>
        ) : null}

        {!isLoading &&
          sections.map((section) => (
            <CarouselRow
              key={section.category.id}
              header={
                <div>
                  <Heading variant="h3" className="font-extrabold">
                    {section.category.name}
                    {isFiltered && city ? ` em ${city.name}` : ''}
                  </Heading>
                  <Link
                    to="/buscar"
                    search={{
                      categoria: section.category.slug,
                      cidadeId: isFiltered ? city?.id : undefined,
                    }}
                    className="text-sm font-semibold text-muted-foreground underline"
                  >
                    Ver todos
                  </Link>
                </div>
              }
            >
              {section.services.map((service) => (
                <div
                  key={service.id}
                  className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[15.5%]"
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </CarouselRow>
          ))}
      </div>

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
            Pesquise por categoria e cidade e fale direto com o profissional.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/buscar">Buscar serviços</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/servicos">Ver categorias</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-[#202124] p-7 text-white dark:bg-card dark:text-card-foreground">
          <Heading
            variant="h2"
            className="font-extrabold text-white dark:text-card-foreground"
          >
            Você presta serviços?
          </Heading>
          <p className="mt-2 text-white/70 dark:text-muted-foreground">
            Publique quantos serviços quiser, com fotos e preço, e receba
            contatos de clientes da sua região.
          </p>
          <Button asChild className="mt-5">
            <Link to="/publicar">Publicar serviço</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
