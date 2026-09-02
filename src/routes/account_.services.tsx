import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CategoryIcon } from '@/components/discovery/category-icon'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import {
  formatRating,
  formatReviewsCount,
  formatServicePrice,
} from '@/lib/format'
import { apiErrorMessage } from '@/lib/form-errors'
import { type Service, type ServiceStatus, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/account_/services')({
  component: MeusServicos,
  head: () => ({ meta: [{ title: 'Meus serviços | FazPerto' }] }),
})

const SKELETON_KEYS = ['s1', 's2', 's3']

const STATUS_LABEL: Record<ServiceStatus, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  archived: 'Arquivado',
}

function MeusServicos() {
  const navigate = useNavigate()
  const { status, token } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({
        to: '/signin',
        search: { redirect: '/account/services' },
        replace: true,
      })
    }
  }, [status, navigate])

  useEffect(() => {
    if (!token) {
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    servicesApi
      .mine(token, { perPage: 60 }, controller.signal)
      .then((result) => setServices(result.data))
      .catch(() => undefined)
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [token])

  async function togglePublish(service: Service) {
    if (!token) {
      return
    }

    const next: ServiceStatus =
      service.status === 'published' ? 'draft' : 'published'

    try {
      const updated = await servicesApi.update(token, service.id, {
        status: next,
      })

      setServices((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      )

      toast.success(
        next === 'published' ? 'Serviço publicado.' : 'Serviço despublicado.',
      )
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  async function confirmDelete() {
    if (!token || !pendingDelete) {
      return
    }

    setIsDeleting(true)

    try {
      await servicesApi.destroy(token, pendingDelete.id)
      setServices((current) =>
        current.filter((entry) => entry.id !== pendingDelete.id),
      )
      toast.success('Serviço removido.')
      setPendingDelete(null)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading variant="h1" className="text-3xl font-extrabold">
            Meus serviços
          </Heading>
          <p className="mt-2 text-muted-foreground">
            Gerencie seus anúncios, fotos e disponibilidade.
          </p>
        </div>

        <Button asChild>
          <Link to="/publish">
            <Plus aria-hidden="true" />
            Novo serviço
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <Heading variant="h4">Você ainda não publicou serviços.</Heading>
          <p className="mt-2 text-muted-foreground">
            Publique o primeiro e comece a receber contatos na sua região.
          </p>
          <Button asChild className="mt-5">
            <Link to="/publish">Publicar serviço</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {services.map((service) => {
            const cover = service.photos?.[0]

            return (
              <li
                key={service.id}
                className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row"
              >
                <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                  {cover?.url ? (
                    <img
                      src={cover.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center">
                      <CategoryIcon
                        name={service.category?.icon ?? 'wrench'}
                        className="size-6 text-muted-foreground/50"
                      />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        service.status === 'published' ? 'success' : 'secondary'
                      }
                    >
                      {STATUS_LABEL[service.status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {service.category?.name}
                    </span>
                  </div>

                  <p className="mt-1 font-semibold">{service.title}</p>

                  <p className="text-sm text-muted-foreground">
                    {service.city?.label} ·{' '}
                    {formatServicePrice(service.priceType, service.priceCents)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {service.reviewsCount > 0
                      ? `★ ${formatRating(service.ratingAverage)} · ${formatReviewsCount(service.reviewsCount)}`
                      : 'Sem avaliações'}
                    {' · '}
                    {service.photos?.length ?? 0} fotos
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to="/account/services/$serviceId"
                        params={{ serviceId: String(service.id) }}
                      >
                        <Pencil aria-hidden="true" />
                        Editar
                      </Link>
                    </Button>

                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/services/$serviceId"
                        params={{ serviceId: String(service.id) }}
                      >
                        <Eye aria-hidden="true" />
                        Ver anúncio
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(service)}
                    >
                      {service.status === 'published'
                        ? 'Despublicar'
                        : 'Publicar'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onClick={() => setPendingDelete(service)}
                    >
                      <Trash2 aria-hidden="true" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” será removido junto com as fotos e as
              avaliações recebidas. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
