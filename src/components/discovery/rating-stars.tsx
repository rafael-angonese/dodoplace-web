import { Star } from 'lucide-react'

import { formatRating } from '@/lib/format'
import { cn } from '@/utils/cn'

export function RatingStars({
  value,
  size = 14,
  showValue = false,
  className,
}: {
  value: number
  size?: number
  showValue?: boolean
  className?: string
}) {
  const rounded = Math.round(value)

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={cn(
              star <= rounded
                ? 'fill-brand-coral text-brand-coral'
                : 'text-muted-foreground/40',
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-sm font-semibold">{formatRating(value)}</span>
      ) : null}
      <span className="sr-only">{formatRating(value)} de 5 estrelas</span>
    </span>
  )
}
