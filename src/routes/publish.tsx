import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useLocation } from '@/components/location/location-context'
import { ServiceForm } from '@/components/service/service-form'
import { ServiceTypeCards } from '@/components/service/service-type-cards'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import { categoriesApi } from '@/lib/categories'
import { type ServiceType, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/publish')({
  component: Publicar,
  head: () => ({ meta: [{ title: 'Publicar | FazPerto' }] }),
  loader: async () => ({ categories: await categoriesApi.list() }),
})

const STEPS = [
  { title: 'O que você quer publicar?' },
  { title: 'Detalhes do anúncio' },
]

const STEP_COPY: Record<
  ServiceType,
  { heading: string; description: string; submitLabel: string; success: string }
> = {
  offer: {
    heading: 'Publicar um serviço',
    description:
      'Descreva o que você faz. Você pode publicar quantos serviços quiser no mesmo perfil.',
    submitLabel: 'Publicar serviço',
    success: 'Serviço publicado.',
  },
  request: {
    heading: 'Publicar um pedido de serviço',
    description:
      'Conte o que você precisa. Profissionais da sua região vão ver o pedido e entrar em contato.',
    submitLabel: 'Publicar pedido',
    success: 'Pedido publicado.',
  },
}

async function uploadMedia(token: string, serviceId: number, files: File[]) {
  let failed = 0

  for (const file of files) {
    try {
      await servicesApi.addPhoto(token, serviceId, file)
    } catch {
      failed += 1
    }
  }

  return failed
}

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm">
      {STEPS.map((entry, index) => {
        const number = index + 1
        const isActive = number === step
        const isDone = number < step

        return (
          <li key={entry.title} className="flex items-center gap-2">
            <span
              className={
                isActive || isDone
                  ? 'grid size-6 place-items-center rounded-full bg-brand-coral text-xs font-bold text-white'
                  : 'grid size-6 place-items-center rounded-full bg-surface-muted text-xs font-bold text-muted-foreground'
              }
            >
              {number}
            </span>
            <span
              className={isActive ? 'font-semibold' : 'text-muted-foreground'}
            >
              {entry.title}
            </span>
            {number < STEPS.length ? (
              <span aria-hidden="true" className="text-muted-foreground/50">
                ·
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function Publicar() {
  const navigate = useNavigate()
  const { categories } = Route.useLoaderData()
  const { status, token } = useAuth()
  const { city } = useLocation()
  const [type, setType] = useState<ServiceType | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({
        to: '/signin',
        search: { redirect: '/publish' },
        replace: true,
      })
    }
  }, [status, navigate])

  if (status !== 'authenticated' || !token) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-3 h-5 w-full max-w-md" />
        <Skeleton className="mt-8 h-96 w-full" />
      </section>
    )
  }

  const copy = type ? STEP_COPY[type] : null

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <StepIndicator step={type ? 2 : 1} />

      {type === null || copy === null ? (
        <div className="mt-6">
          <Heading variant="h1" className="text-3xl font-extrabold">
            O que você quer publicar?
          </Heading>
          <p className="mt-2 text-muted-foreground">
            Escolha uma das opções para continuar. Você pode publicar quantos
            anúncios quiser no mesmo perfil.
          </p>

          <ServiceTypeCards value={type} onChange={setType} className="mt-8" />
        </div>
      ) : (
        <div className="mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => setType(null)}
          >
            <ArrowLeft aria-hidden="true" />
            Trocar tipo de anúncio
          </Button>

          <Heading variant="h1" className="mt-3 text-3xl font-extrabold">
            {copy.heading}
          </Heading>
          <p className="mt-2 text-muted-foreground">{copy.description}</p>

          <div className="mt-8">
            <ServiceForm
              key={type}
              type={type}
              categories={categories}
              initialCity={city}
              submitLabel={copy.submitLabel}
              onBack={() => setType(null)}
              onSubmit={async ({ media, ...input }) => {
                const service = await servicesApi.create(token, input)
                const failed = await uploadMedia(token, service.id, media)

                if (failed > 0) {
                  toast.error(
                    `Anúncio publicado, mas ${failed} arquivo(s) não foram enviados. Tente novamente na edição.`,
                  )
                } else {
                  toast.success(copy.success)
                }

                navigate({
                  to: '/account/services/$serviceId',
                  params: { serviceId: String(service.id) },
                })
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
