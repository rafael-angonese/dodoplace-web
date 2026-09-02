import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'

import { RatingStars } from '@/components/discovery/rating-stars'
import { ReviewForm } from '@/components/service/review-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { formatRating, formatReviewsCount } from '@/lib/format'
import { type ServiceReview, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

const PAGE_SIZE = 6

function ReviewItem({ review }: { review: ServiceReview }) {
  const author = review.author

  return (
    <li className="space-y-2">
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {author?.avatarUrl ? (
            <AvatarImage
              src={author.avatarUrl}
              alt={author.name ?? ''}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-brand-yellow text-xs font-extrabold text-[#202124]">
            {author?.initials ?? '??'}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate font-semibold">
            {author?.name ?? 'Usuário do FazPerto'}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(review.createdAt), "MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
      </div>

      <RatingStars value={review.rating} size={13} />

      {review.comment ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      ) : null}
    </li>
  )
}

export function ServiceReviews({
  serviceId,
  ratingAverage,
  reviewsCount,
  isOwner,
}: {
  serviceId: number
  ratingAverage: number
  reviewsCount: number
  isOwner: boolean
}) {
  const { status, user } = useAuth()
  const [reviews, setReviews] = useState<ServiceReview[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(reviewsCount)
  const [average, setAverage] = useState(ratingAverage)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)

    servicesApi
      .reviews(serviceId, { pagina: page, porPagina: PAGE_SIZE }, controller.signal)
      .then((result) => {
        setReviews((current) =>
          page === 1 ? result.data : [...current, ...result.data],
        )
        setLastPage(result.metadata.lastPage)
        setTotal(result.metadata.total)
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [serviceId, page])

  const mine = user ? reviews.find((review) => review.userId === user.id) : null

  function onSaved(review: ServiceReview) {
    setReviews((current) => {
      const without = current.filter((entry) => entry.id !== review.id)
      return [review, ...without]
    })
    setTotal((current) => (mine ? current : current + 1))
    setAverage((current) =>
      mine
        ? current
        : Math.round(((current * total + review.rating) / (total + 1)) * 100) /
          100,
    )
  }

  function onRemoved() {
    setReviews((current) =>
      current.filter((entry) => entry.userId !== user?.id),
    )
    setTotal((current) => Math.max(0, current - 1))
  }

  return (
    <section className="space-y-5">
      <div className="flex items-baseline gap-2">
        <Heading variant="h3" className="font-extrabold">
          {total > 0 ? (
            <>
              ★ {formatRating(average)} · {formatReviewsCount(total)}
            </>
          ) : (
            'Avaliações'
          )}
        </Heading>
      </div>

      {total === 0 && !isLoading ? (
        <p className="text-muted-foreground">
          Este serviço ainda não recebeu avaliações.
        </p>
      ) : null}

      {reviews.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      ) : null}

      {page < lastPage ? (
        <Button
          variant="outline"
          onClick={() => setPage((current) => current + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Mostrar mais avaliações'}
        </Button>
      ) : null}

      {isOwner ? (
        <p className="text-sm text-muted-foreground">
          Você não pode avaliar o seu próprio serviço.
        </p>
      ) : status === 'authenticated' ? (
        <ReviewForm
          key={mine?.id ?? 'new'}
          serviceId={serviceId}
          existing={mine ?? null}
          onSaved={onSaved}
          onRemoved={onRemoved}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-5">
          <p className="text-muted-foreground">
            <Link to="/entrar" className="font-semibold underline">
              Entre na sua conta
            </Link>{' '}
            para avaliar este serviço.
          </p>
        </div>
      )}
    </section>
  )
}
