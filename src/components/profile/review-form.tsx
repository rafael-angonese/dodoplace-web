import { Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/text-area'
import { apiErrorMessage } from '@/lib/form-errors'
import { type UserReview, reviewsApi } from '@/lib/reviews'
import { useAuth } from '@/providers/auth-context'
import { cn } from '@/utils/cn'

export function ReviewForm({
  userId,
  existing,
  onSaved,
  onRemoved,
}: {
  userId: number
  existing: UserReview | null
  onSaved: (review: UserReview) => void
  onRemoved: () => void
}) {
  const { token } = useAuth()
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!token) {
      return
    }

    if (rating < 1) {
      toast.error('Escolha de 1 a 5 estrelas.')
      return
    }

    setIsSaving(true)

    try {
      const review = await reviewsApi.save(token, userId, {
        rating,
        comment: comment.trim() || null,
      })

      onSaved(review)
      toast.success('Avaliação enviada. Obrigado!')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function remove() {
    if (!token) {
      return
    }

    setIsSaving(true)

    try {
      await reviewsApi.remove(token, userId)
      setRating(0)
      setComment('')
      onRemoved()
      toast.success('Avaliação removida.')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const shown = hovered || rating

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border p-5">
      <p className="font-bold">
        {existing ? 'Sua avaliação' : 'Avalie este profissional'}
      </p>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
            className="p-0.5"
          >
            <Star
              className={cn(
                'size-7 transition',
                star <= shown
                  ? 'fill-brand-coral text-brand-coral'
                  : 'text-muted-foreground/40',
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Conte como foi o atendimento (opcional)."
        rows={4}
        className="mt-4"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : existing ? 'Atualizar' : 'Enviar avaliação'}
        </Button>
        {existing ? (
          <Button
            type="button"
            variant="ghost"
            onClick={remove}
            disabled={isSaving}
          >
            Remover
          </Button>
        ) : null}
      </div>
    </form>
  )
}
