import { useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/providers/auth-context'
import { useFavorites } from '@/providers/favorites-context'
import { cn } from '@/utils/cn'

export function FavoriteButton({
  serviceId,
  className,
  size = 18,
}: {
  serviceId: number
  className?: string
  size?: number
}) {
  const navigate = useNavigate()
  const { status } = useAuth()
  const { isFavorited, toggle } = useFavorites()
  const [isPending, setIsPending] = useState(false)

  const favorited = isFavorited(serviceId)

  async function onClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (status !== 'authenticated') {
      navigate({ to: '/signin', search: { redirect: '/favorites' } })
      return
    }

    setIsPending(true)

    try {
      const next = await toggle(serviceId)
      toast.success(next ? 'Salvo nos favoritos.' : 'Removido dos favoritos.')
    } catch {
      toast.error('Não foi possível atualizar seus favoritos.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={
        favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'
      }
      className={cn(
        'grid size-9 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:scale-105 disabled:opacity-60',
        className,
      )}
    >
      <Heart
        size={size}
        className={cn(
          'transition-colors',
          favorited ? 'fill-brand-coral text-brand-coral' : 'text-foreground',
        )}
      />
    </button>
  )
}
