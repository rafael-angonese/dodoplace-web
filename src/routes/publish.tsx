import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { useLocation } from '@/components/location/location-context'
import { ServiceForm } from '@/components/service/service-form'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import { categoriesApi } from '@/lib/categories'
import { servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/publish')({
  component: Publicar,
  head: () => ({ meta: [{ title: 'Publicar serviço | FazPerto' }] }),
  loader: async () => ({ categories: await categoriesApi.list() }),
})

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

function Publicar() {
  const navigate = useNavigate()
  const { categories } = Route.useLoaderData()
  const { status, token } = useAuth()
  const { city } = useLocation()

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

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Publicar um serviço
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Descreva o que você faz. Você pode publicar quantos serviços quiser no
        mesmo perfil.
      </p>

      <div className="mt-8">
        <ServiceForm
          categories={categories}
          initialCity={city}
          submitLabel="Publicar serviço"
          onSubmit={async ({ media, ...input }) => {
            const service = await servicesApi.create(token, input)
            const failed = await uploadMedia(token, service.id, media)

            if (failed > 0) {
              toast.error(
                `Serviço publicado, mas ${failed} arquivo(s) não foram enviados. Tente novamente na edição.`,
              )
            } else {
              toast.success('Serviço publicado.')
            }

            navigate({
              to: '/account/services/$serviceId',
              params: { serviceId: String(service.id) },
            })
          }}
        />
      </div>
    </section>
  )
}
