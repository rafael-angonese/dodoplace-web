import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ServiceForm } from '@/components/service/service-form'
import { ServicePhotoManager } from '@/components/service/service-photo-manager'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { type ServiceCategory, categoriesApi } from '@/lib/categories'
import { apiErrorMessage, isAbortError } from '@/lib/form-errors'
import { type Service, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/conta_/servicos_/$serviceId')({
  component: EditarServico,
  head: () => ({ meta: [{ title: 'Editar serviço | FazPerto' }] }),
  loader: async () => ({ categories: await categoriesApi.list() }),
})

function EditarServico() {
  const navigate = useNavigate()
  const { serviceId } = Route.useParams()
  const { categories } = Route.useLoaderData()
  const { status, token, user } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [error, setError] = useState<string | null>(null)

  const id = Number(serviceId)

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({
        to: '/entrar',
        search: { redirect: `/conta/servicos/${serviceId}` },
        replace: true,
      })
    }
  }, [status, navigate, serviceId])

  useEffect(() => {
    if (!token) {
      return
    }

    const controller = new AbortController()

    servicesApi
      .show(id, { token, signal: controller.signal })
      .then((found) => {
        setService(found)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (isAbortError(cause)) {
          return
        }

        setError(apiErrorMessage(cause))
      })

    return () => controller.abort()
  }, [id, token])

  if (error) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <Heading variant="h1" className="text-2xl font-extrabold">
          Não foi possível abrir este serviço
        </Heading>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/conta/servicos">Voltar para meus serviços</Link>
        </Button>
      </section>
    )
  }

  if (!service || !token) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-8 h-96 w-full" />
      </section>
    )
  }

  if (user && service.userId !== user.id) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <Heading variant="h1" className="text-2xl font-extrabold">
          Este serviço não é seu
        </Heading>
        <p className="mt-2 text-muted-foreground">
          Você só pode editar serviços que publicou.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/conta/servicos">Voltar para meus serviços</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/conta/servicos">
          <ArrowLeft aria-hidden="true" />
          Meus serviços
        </Link>
      </Button>

      <Heading variant="h1" className="mt-3 text-3xl font-extrabold">
        Editar serviço
      </Heading>
      <p className="mt-2 text-muted-foreground">{service.title}</p>

      <div className="mt-8">
        <ServicePhotoManager
          serviceId={service.id}
          photos={service.photos ?? []}
        />
      </div>

      <Separator className="my-8" />

      <EditForm
        categories={categories}
        service={service}
        onSaved={(updated) => {
          setService(updated)
          toast.success('Serviço atualizado.')
        }}
        token={token}
      />
    </section>
  )
}

function EditForm({
  categories,
  service,
  token,
  onSaved,
}: {
  categories: ServiceCategory[]
  service: Service
  token: string
  onSaved: (service: Service) => void
}) {
  return (
    <ServiceForm
      categories={categories}
      service={service}
      initialCity={service.city ?? null}
      submitLabel="Salvar alterações"
      onSubmit={async (values) => {
        const updated = await servicesApi.update(token, service.id, {
          title: values.title,
          description: values.description,
          categoryId: values.categoryId,
          cityId: values.cityId,
          priceType: values.priceType,
          priceCents: values.priceCents,
          serviceMode: values.serviceMode,
          coverageRadiusKm: values.coverageRadiusKm,
          neighborhood: values.neighborhood,
          status: values.publish ? 'published' : 'draft',
        })

        onSaved({ ...updated, photos: service.photos })
      }}
    />
  )
}
