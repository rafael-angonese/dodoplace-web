import { Link } from '@tanstack/react-router'
import { MapPin, Star } from 'lucide-react'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { FavoriteButton } from '@/components/discovery/favorite-button'
import {
  formatDistance,
  formatRating,
  formatServicePrice,
} from '@/lib/format'
import { type Service, serviceCover } from '@/lib/services'
import { cn } from '@/utils/cn'

function Cover({ service }: { service: Service }) {
  const photo = serviceCover(service)

  if (photo?.url) {
    return (
      <img
        src={photo.url}
        alt={service.title}
        loading="lazy"
        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    )
  }

  return (
    <span className="grid size-full place-items-center bg-surface-muted">
      <CategoryIcon
        name={service.category?.icon ?? 'wrench'}
        className="size-10 text-muted-foreground/50"
      />
    </span>
  )
}

export function ServiceCard({
  service,
  className,
}: {
  service: Service
  className?: string
}) {
  const distance = formatDistance(service.distanceKm)
  const provider = service.provider

  return (
    <article className={cn('group relative', className)}>
      <div className="relative overflow-hidden rounded-2xl bg-surface-muted">
        <div className="aspect-square">
          <Cover service={service} />
        </div>

        <FavoriteButton
          serviceId={service.id}
          className="absolute top-2.5 right-2.5"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
          {service.type === 'request' ? (
            <span className="rounded-full bg-brand-coral px-2.5 py-1 text-[11px] font-bold text-white">
              Pedido
            </span>
          ) : null}
          {service.status === 'draft' ? (
            <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-bold">
              Rascunho
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 leading-snug font-semibold">
          <Link
            to="/services/$serviceId"
            params={{ serviceId: String(service.id) }}
            className="after:absolute after:inset-0"
          >
            {service.title}
          </Link>
        </h3>

        <p className="truncate text-sm text-muted-foreground">
          {service.category?.name}
          {service.city ? ` · ${service.city.label}` : ''}
        </p>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {provider && provider.reviewsCount > 0 ? (
            <>
              <Star
                aria-hidden="true"
                className="size-3.5 fill-foreground text-foreground"
              />
              <span className="font-semibold text-foreground">
                {formatRating(provider.ratingAverage)}
              </span>
              <span>({provider.reviewsCount})</span>
            </>
          ) : (
            <span>Sem avaliações ainda</span>
          )}
          {distance ? (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {distance}
            </span>
          ) : null}
        </p>

        <p className="pt-0.5 text-sm">
          {service.priceCents === null ? (
            <span className="font-semibold">Orçamento a combinar</span>
          ) : (
            <>
              <span className="text-muted-foreground">
                {service.type === 'request'
                  ? 'Pretende pagar '
                  : 'A partir de '}
              </span>
              <span className="font-semibold underline">
                {formatServicePrice(service.priceType, service.priceCents)}
              </span>
            </>
          )}
        </p>
      </div>
    </article>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-surface-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-4/5 rounded bg-surface-muted" />
        <div className="h-3 w-3/5 rounded bg-surface-muted" />
        <div className="h-3 w-2/5 rounded bg-surface-muted" />
      </div>
    </div>
  )
}
