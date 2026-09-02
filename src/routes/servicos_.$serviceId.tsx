import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Pencil, Share2, Star } from 'lucide-react'
import { toast } from 'sonner'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { FavoriteButton } from '@/components/discovery/favorite-button'
import { ProviderPanel } from '@/components/service/provider-panel'
import { ServiceGallery } from '@/components/service/service-gallery'
import { ServiceReviews } from '@/components/service/service-reviews'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ApiError } from '@/lib/api'
import {
  PRICE_TYPE_LABEL,
  SERVICE_MODE_LABEL,
  formatRating,
  formatReviewsCount,
  formatServicePrice,
} from '@/lib/format'
import { servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/servicos_/$serviceId')({
  component: ServiceDetail,
  loader: async ({ params }) => {
    const id = Number(params.serviceId)

    if (!Number.isFinite(id) || id <= 0) {
      throw notFound()
    }

    try {
      const service = await servicesApi.show(id)
      const provider = await servicesApi.profile(service.userId)

      return { service, provider }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound()
      }

      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.service.title ?? 'Serviço'} | FazPerto` },
      {
        name: 'description',
        content: loaderData?.service.description.slice(0, 160) ?? '',
      },
    ],
  }),
})

function ServiceDetail() {
  const { service, provider } = Route.useLoaderData()
  const { user } = useAuth()

  const isOwner = user?.id === service.userId
  const photos = service.photos ?? []

  async function share() {
    const url = window.location.href

    if (navigator.share) {
      await navigator.share({ title: service.title, url }).catch(() => undefined)
      return
    }

    await navigator.clipboard.writeText(url).catch(() => undefined)
    toast.success('Link copiado.')
  }

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          Serviços
        </Link>
        {service.category ? (
          <>
            <span aria-hidden="true">·</span>
            <Link
              to="/"
              search={{ categoria: service.category.slug }}
              className="hover:underline"
            >
              {service.category.name}
            </Link>
          </>
        ) : null}
        {service.city ? (
          <>
            <span aria-hidden="true">·</span>
            <Link
              to="/"
              search={{ cidadeId: service.city.id }}
              className="hover:underline"
            >
              {service.city.label}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-10">
          <ServiceGallery
            photos={photos}
            title={service.title}
            categoryIcon={service.category?.icon ?? 'wrench'}
          />

          <header className="space-y-3">
            <Heading variant="h1" className="text-3xl font-extrabold md:text-4xl">
              {service.title}
            </Heading>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {service.reviewsCount > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star
                    aria-hidden="true"
                    className="size-4 fill-foreground text-foreground"
                  />
                  {formatRating(service.ratingAverage)}
                  <span className="font-normal text-muted-foreground">
                    · {formatReviewsCount(service.reviewsCount)}
                  </span>
                </span>
              ) : (
                <span>Ainda sem avaliações</span>
              )}

              {service.category ? (
                <span className="inline-flex items-center gap-1.5">
                  <CategoryIcon
                    name={service.category.icon}
                    className="size-4"
                  />
                  {service.category.name}
                </span>
              ) : null}

              {service.city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {service.neighborhood
                    ? `${service.neighborhood}, ${service.city.label}`
                    : service.city.label}
                </span>
              ) : null}

              <span>{SERVICE_MODE_LABEL[service.serviceMode]}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={share}>
                <Share2 aria-hidden="true" />
                Compartilhar
              </Button>
              <FavoriteButton
                serviceId={service.id}
                className="size-9 border border-border"
              />
              {isOwner ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/conta/servicos/$serviceId"
                    params={{ serviceId: String(service.id) }}
                  >
                    <Pencil aria-hidden="true" />
                    Editar
                  </Link>
                </Button>
              ) : null}
            </div>
          </header>

          <Separator />

          <section className="space-y-3">
            <Heading variant="h3" className="font-extrabold">
              Sobre o serviço
            </Heading>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {service.description}
            </p>
          </section>

          <Separator />

          <ProviderPanel provider={provider} serviceTitle={service.title} />

          <Separator />

          <ServiceReviews
            serviceId={service.id}
            ratingAverage={service.ratingAverage}
            reviewsCount={service.reviewsCount}
            isOwner={isOwner}
          />

          <Separator />

          <section className="space-y-3">
            <Heading variant="h3" className="font-extrabold">
              Onde este serviço é atendido
            </Heading>
            <p className="text-muted-foreground">
              {SERVICE_MODE_LABEL[service.serviceMode]}
              {service.city ? ` em ${service.city.label}` : ''}
              {service.coverageRadiusKm
                ? `, com atendimento em até ${service.coverageRadiusKm} km da cidade.`
                : '.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Publicado em{' '}
              {format(
                new Date(service.publishedAt ?? service.createdAt),
                "d 'de' MMMM 'de' yyyy",
                { locale: ptBR },
              )}
              . Combine o local exato diretamente com o profissional.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {PRICE_TYPE_LABEL[service.priceType]}
            </p>
            <p className="mt-1 text-3xl font-extrabold">
              {formatServicePrice(service.priceType, service.priceCents)}
            </p>

            {service.reviewsCount > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1 text-sm">
                <Star
                  aria-hidden="true"
                  className="size-4 fill-foreground text-foreground"
                />
                <span className="font-semibold">
                  {formatRating(service.ratingAverage)}
                </span>
                <span className="text-muted-foreground">
                  · {formatReviewsCount(service.reviewsCount)}
                </span>
              </p>
            ) : null}

            <div className="mt-5">
              <ProviderContact
                provider={provider}
                serviceTitle={service.title}
              />
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              O FazPerto conecta você ao profissional. O combinado de preço,
              data e pagamento é feito diretamente entre vocês.
            </p>
          </div>
        </aside>
      </div>
    </article>
  )
}

function ProviderContact({
  provider,
  serviceTitle,
}: {
  provider: { whatsapp: string | null; id: number; name: string | null }
  serviceTitle: string
}) {
  const digits = provider.whatsapp?.replace(/\D/g, '') ?? ''
  const link = digits
    ? `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encodeURIComponent(
        `Olá! Vi seu serviço "${serviceTitle}" no FazPerto e gostaria de um orçamento.`,
      )}`
    : null

  if (!link) {
    return (
      <Button asChild fullWidth variant="outline">
        <Link to="/perfil/$userId" params={{ userId: String(provider.id) }}>
          Ver contatos do profissional
        </Link>
      </Button>
    )
  }

  return (
    <Button asChild fullWidth size="lg">
      <a href={link} target="_blank" rel="noreferrer noopener">
        Falar com {provider.name?.split(' ')[0] ?? 'o profissional'}
      </a>
    </Button>
  )
}
