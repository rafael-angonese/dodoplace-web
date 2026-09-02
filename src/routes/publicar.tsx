import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { useLocation } from '@/components/location/location-context'
import { ServiceForm } from '@/components/service/service-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import { categoriesApi } from '@/lib/categories'
import { servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/publicar')({
  component: Publicar,
  head: () => ({ meta: [{ title: 'Publicar serviço | FazPerto' }] }),
  loader: async () => ({ categories: await categoriesApi.list() }),
})

function Publicar() {
  const navigate = useNavigate()
  const { categories } = Route.useLoaderData()
  const { status, token, user } = useAuth()
  const { city } = useLocation()

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({
        to: '/entrar',
        search: { redirect: '/publicar' },
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

      {!user?.whatsapp ? (
        <Alert className="mt-6">
          <AlertDescription>
            Adicione seu WhatsApp em{' '}
            <Link to="/conta" className="font-semibold underline">
              Meu perfil
            </Link>{' '}
            para que os clientes consigam falar com você.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8">
        <ServiceForm
          categories={categories}
          initialCity={city}
          submitLabel="Publicar serviço"
          onSubmit={async (values) => {
            const service = await servicesApi.create(token, values)

            toast.success(
              values.publish
                ? 'Serviço publicado. Agora adicione fotos.'
                : 'Rascunho salvo. Agora adicione fotos.',
            )

            navigate({
              to: '/conta/servicos/$serviceId',
              params: { serviceId: String(service.id) },
            })
          }}
        />
      </div>
    </section>
  )
}
