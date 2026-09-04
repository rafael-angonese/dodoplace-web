import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ServiceForm } from '@/components/service/service-form'
import { ServiceModerationNotice } from '@/components/service/service-moderation-notice'
import { ServicePhotoManager } from '@/components/service/service-photo-manager'
import { ServiceTypeCards } from '@/components/service/service-type-cards'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { type ServiceCategory, categoriesApi } from '@/lib/categories'
import { apiErrorMessage, isAbortError } from '@/lib/form-errors'
import { type Service, type ServiceType, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/account_/services_/$serviceId')({
  component: EditarServico,
  head: () => ({ meta: [{ title: 'Editar anúncio | DodoPlace' }] }),
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
        to: '/signin',
        search: { redirect: `/account/services/${serviceId}` },
        replace: true,
      })
    }
  }, [status, navigate, serviceId])

  const load = useCallback(
    (signal?: AbortSignal) => {
      if (!token) {
        return
      }

      servicesApi
        .show(id, { token, signal })
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
    },
    [id, token],
  )

  useEffect(() => {
    const controller = new AbortController()

    load(controller.signal)

    return () => controller.abort()
  }, [load])

  if (error) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <Heading variant="h1" className="text-2xl font-extrabold">
          Não foi possível abrir este anúncio
        </Heading>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/account/services">Voltar para meus serviços</Link>
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
          <Link to="/account/services">Voltar para meus serviços</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/account/services">
          <ArrowLeft aria-hidden="true" />
          Meus serviços
        </Link>
      </Button>

      <Heading variant="h1" className="mt-3 text-3xl font-extrabold">
        {service.type === 'request' ? 'Editar pedido' : 'Editar serviço'}
      </Heading>
      <p className="mt-2 text-muted-foreground">{service.title}</p>

      <div className="mt-8">
        <ServiceModerationNotice service={service} />
      </div>

      <div className="mt-8">
        <ServicePhotoManager
          serviceId={service.id}
          photos={service.photos ?? []}
          onPhotosChanged={() => load()}
        />
      </div>

      <Separator className="my-8" />

      <EditForm
        categories={categories}
        service={service}
        onSaved={(updated) => {
          setService(updated)
          toast.success('Anúncio atualizado.')
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
  const [type, setType] = useState<ServiceType>(service.type)

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Heading variant="h4" className="font-extrabold">
          Tipo de anúncio
        </Heading>
        <ServiceTypeCards value={type} onChange={setType} />
      </div>

      <ServiceForm
        type={type}
        categories={categories}
        service={service}
        initialCity={service.city ?? null}
        submitLabel="Salvar alterações"
        onSubmit={async (values) => {
          const updated = await servicesApi.update(token, service.id, {
            type: values.type,
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
    </div>
  )
}
