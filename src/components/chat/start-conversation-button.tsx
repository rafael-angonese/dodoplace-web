import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { MessagesSquare } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button, type ButtonProps } from '@/components/ui/button'
import { ApiError } from '@/lib/api'
import { chatApi } from '@/lib/chat'
import { chatKeys } from '@/lib/queries'
import { useAuth } from '@/providers/auth-context'

export function StartConversationButton({
  recipientId,
  serviceId,
  label = 'Conversar pelo FazPerto',
  ...props
}: ButtonProps & {
  recipientId: number
  serviceId?: number | null
  label?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token, user } = useAuth()
  const [isPending, setIsPending] = useState(false)

  if (user?.id === recipientId) {
    return null
  }

  async function start() {
    if (!token) {
      await navigate({ to: '/signin', search: { redirect: '/chats' } })
      return
    }

    setIsPending(true)

    try {
      const conversation = await chatApi.start(token, {
        recipientId,
        serviceId: serviceId ?? null,
      })

      await queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot })
      await navigate({
        to: '/chats/$conversationId',
        params: { conversationId: String(conversation.id) },
      })
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível abrir a conversa.',
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button type="button" disabled={isPending} onClick={() => void start()} {...props}>
      <MessagesSquare aria-hidden="true" />
      {label}
    </Button>
  )
}
