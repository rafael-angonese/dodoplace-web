import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import {
  ServiceCard,
  ServiceCardSkeleton,
} from '@/components/discovery/service-card'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { type Service, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'
import { useFavorites } from '@/providers/favorites-context'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5']

export const Route = createFileRoute('/favorites')({
  component: Favoritos,
  head: () => ({ meta: [{ title: 'Favoritos | FazPerto' }] }),
})

function Favoritos() {
  const navigate = useNavigate()
  const { status, token } = useAuth()
  const { ids } = useFavorites()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({
        to: '/signin',
        search: { redirect: '/favorites' },
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
      .favorites(token, { perPage: 60 }, controller.signal)
      .then((result) => setServices(result.data))
      .catch(() => undefined)
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [token])

  const visible = services.filter((service) => ids.has(service.id))

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Favoritos
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Os serviços que você salvou para decidir depois.
      </p>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SKELETON_KEYS.map((key) => (
            <ServiceCardSkeleton key={key} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <Heading variant="h4">Você ainda não salvou nenhum serviço.</Heading>
          <p className="mt-2 text-muted-foreground">
            Toque no coração dos serviços que te interessarem para encontrá-los
            aqui.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Explorar serviços</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </section>
  )
}
