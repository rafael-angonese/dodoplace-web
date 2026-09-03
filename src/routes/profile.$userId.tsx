import { createFileRoute, notFound } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { ServiceCard } from '@/components/discovery/service-card'
import { UserReviews } from '@/components/profile/user-reviews'
import { ProviderPanel } from '@/components/service/provider-panel'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ApiError } from '@/lib/api'
import { servicesApi } from '@/lib/services'

export const Route = createFileRoute('/profile/$userId')({
  component: Perfil,
  loader: async ({ params }) => {
    const id = Number(params.userId)

    if (!Number.isFinite(id) || id <= 0) {
      throw notFound()
    }

    try {
      return { profile: await servicesApi.profile(id) }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound()
      }

      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.profile.name ?? 'Perfil'} | FazPerto`,
      },
    ],
  }),
})

function Perfil() {
  const { profile } = Route.useLoaderData()
  const services = profile.services ?? []

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <ProviderPanel provider={profile} showProfileLink={false} />

          <p className="mt-4 px-1 text-sm text-muted-foreground">
            No FazPerto desde{' '}
            {format(new Date(profile.createdAt), "MMMM 'de' yyyy", {
              locale: ptBR,
            })}
            .
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <Heading variant="h2" className="font-extrabold">
              {services.length === 0
                ? 'Serviços'
                : `${services.length} ${services.length === 1 ? 'serviço publicado' : 'serviços publicados'}`}
            </Heading>

            {services.length === 0 ? (
              <p className="mt-3 text-muted-foreground">
                Este profissional ainda não publicou serviços.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </section>

          <Separator />

          <UserReviews
            userId={profile.id}
            name={profile.name}
            ratingAverage={profile.ratingAverage}
            reviewsCount={profile.reviewsCount}
          />
        </div>
      </div>
    </section>
  )
}
