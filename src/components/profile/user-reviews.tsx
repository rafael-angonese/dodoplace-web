import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'

import { RatingStars } from '@/components/discovery/rating-stars'
import { ReviewForm } from '@/components/profile/review-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { formatRating, formatReviewsCount } from '@/lib/format'
import { type UserReview, reviewsApi } from '@/lib/reviews'
import { useAuth } from '@/providers/auth-context'

const PAGE_SIZE = 6

function ReviewItem({ review }: { review: UserReview }) {
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
          <AvatarFallback className="bg-dodo-orange text-xs font-extrabold text-dodo-blue-deep">
            {author?.initials ?? '??'}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate font-semibold">
            {author?.name ?? 'Usuário do DodoPlace'}
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

export function UserReviews({
  userId,
  name,
  ratingAverage,
  reviewsCount,
}: {
  userId: number
  name: string | null
  ratingAverage: number
  reviewsCount: number
}) {
  const { status, user } = useAuth()
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(reviewsCount)
  const [sum, setSum] = useState(ratingAverage * reviewsCount)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)

    reviewsApi
      .list(userId, { page, perPage: PAGE_SIZE }, controller.signal)
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
  }, [userId, page])

  const isOwnProfile = user?.id === userId
  const mine = user
    ? reviews.find((review) => review.authorId === user.id)
    : null
  const firstName = name?.split(' ')[0] ?? 'este profissional'
  const average = total > 0 ? sum / total : 0

  function onSaved(review: UserReview) {
    const previous = mine?.rating ?? 0

    setReviews((current) => [
      review,
      ...current.filter((entry) => entry.id !== review.id),
    ])
    setTotal((current) => (mine ? current : current + 1))
    setSum((current) => current - previous + review.rating)
  }

  function onRemoved() {
    const previous = mine?.rating ?? 0

    setReviews((current) =>
      current.filter((entry) => entry.authorId !== user?.id),
    )
    setTotal((current) => Math.max(0, current - 1))
    setSum((current) => Math.max(0, current - previous))
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
          {isOwnProfile
            ? 'Você ainda não recebeu avaliações.'
            : `${firstName} ainda não recebeu avaliações.`}
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

      {isOwnProfile ? null : status === 'authenticated' ? (
        <ReviewForm
          key={mine?.id ?? 'new'}
          userId={userId}
          existing={mine ?? null}
          onSaved={onSaved}
          onRemoved={onRemoved}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-5">
          <p className="text-muted-foreground">
            <Link to="/signin" className="font-semibold underline">
              Entre na sua conta
            </Link>{' '}
            para avaliar {firstName}.
          </p>
        </div>
      )}
    </section>
  )
}
