import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ChatAvatar } from '@/components/chat/chat-avatar'
import { MessageBubble } from '@/components/chat/message-bubble'
import { MessageComposer } from '@/components/chat/message-composer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api'
import {
  type ChatMessage,
  type SendMessageInput,
  chatApi,
  otherParticipant,
} from '@/lib/chat'
import { appendMessage, setMessageReactions } from '@/lib/chat-cache'
import { formatDayLabel, formatLastSeen } from '@/lib/format'
import { conversationQueryOptions, messagesQueryOptions } from '@/lib/queries'
import { useAuth } from '@/providers/auth-context'
import { useChat } from '@/providers/chat-context'

const TYPING_CLEAR_MS = 6_000

const SKELETON_KEYS = ['m1', 'm2', 'm3', 'm4']

function dayKey(value: string) {
  return value.slice(0, 10)
}

export function MessageThread({ conversationId }: { conversationId: number }) {
  const queryClient = useQueryClient()
  const { token, user } = useAuth()
  const { subscribe, sendTyping } = useChat()

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const conversationQuery = useQuery({
    ...conversationQueryOptions(token ?? '', conversationId),
    enabled: Boolean(token),
  })

  const messagesQuery = useInfiniteQuery({
    ...messagesQueryOptions(token ?? '', conversationId),
    enabled: Boolean(token),
  })

  const messages = useMemo(
    () =>
      [...(messagesQuery.data?.pages ?? [])]
        .reverse()
        .flatMap((page) => page.data),
    [messagesQuery.data],
  )

  const conversation = conversationQuery.data
  const partner = conversation
    ? otherParticipant(conversation, user?.id)
    : undefined
  const lastMessage = messages.at(-1)
  const unreadMessageId =
    lastMessage && lastMessage.userId !== user?.id ? lastMessage.id : null

  useEffect(() => {
    return subscribe((event) => {
      if (
        event.type !== 'conversation.typing' ||
        event.conversationId !== conversationId ||
        event.userId === user?.id
      ) {
        return
      }

      setIsPartnerTyping(event.isTyping)

      if (typingTimer.current) {
        clearTimeout(typingTimer.current)
        typingTimer.current = null
      }

      if (event.isTyping) {
        typingTimer.current = setTimeout(
          () => setIsPartnerTyping(false),
          TYPING_CLEAR_MS,
        )
      }
    })
  }, [subscribe, conversationId, user?.id])

  useEffect(() => {
    if (!token || !unreadMessageId) {
      return
    }

    void chatApi
      .markRead(token, conversationId, unreadMessageId)
      .catch(() => undefined)
  }, [token, conversationId, unreadMessageId])

  useEffect(() => {
    const container = scrollRef.current

    if (!container || messages.length === 0) {
      return
    }

    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight

    if (firstRender.current || distanceToBottom < 240) {
      container.scrollTop = container.scrollHeight
      firstRender.current = false
    }
  }, [messages.length])

  const send = useCallback(
    async (input: SendMessageInput) => {
      if (!token) {
        return
      }

      setIsSending(true)

      try {
        const message = await chatApi.sendMessage(token, conversationId, input)

        appendMessage(queryClient, conversationId, message)
        setReplyTo(null)
        firstRender.current = true
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Não foi possível enviar a mensagem.',
        )
      } finally {
        setIsSending(false)
      }
    },
    [token, conversationId, queryClient],
  )

  const toggleReaction = useCallback(
    async (message: ChatMessage, emoji: string) => {
      if (!token) {
        return
      }

      const reacted = (message.reactions ?? []).some(
        (reaction) => reaction.userId === user?.id && reaction.emoji === emoji,
      )

      try {
        const reactions = reacted
          ? await chatApi.unreact(token, message.id, emoji)
          : await chatApi.react(token, message.id, emoji)

        setMessageReactions(queryClient, conversationId, message.id, reactions)
      } catch {
        toast.error('Não foi possível registrar sua reação.')
      }
    },
    [token, user?.id, queryClient, conversationId],
  )

  if (conversationQuery.isPending) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-14 w-2/3 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (conversationQuery.isError || !conversation) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
        Não foi possível carregar esta conversa.
      </div>
    )
  }

  let lastDay = ''

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-3 py-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
        >
          <Link to="/conversas" aria-label="Voltar para conversas">
            <ArrowLeft aria-hidden="true" />
          </Link>
        </Button>

        <ChatAvatar
          user={partner?.user}
          isOnline={partner?.isOnline}
          className="size-10"
        />

        <div className="min-w-0 flex-1">
          <Link
            to="/perfil/$userId"
            params={{ userId: String(partner?.userId ?? 0) }}
            className="block truncate font-semibold hover:underline"
          >
            {partner?.user?.name ?? 'Usuário'}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {isPartnerTyping
              ? 'digitando…'
              : partner?.isOnline
                ? 'online'
                : formatLastSeen(partner?.lastSeenAt ?? null)}
          </p>
        </div>

        {conversation.service ? (
          <Link
            to="/servicos/$serviceId"
            params={{ serviceId: String(conversation.service.id) }}
            className="hidden max-w-56 truncate rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent sm:block"
          >
            {conversation.service.title}
          </Link>
        ) : null}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {messagesQuery.hasNextPage ? (
          <div className="mb-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => void messagesQuery.fetchNextPage()}
            >
              {messagesQuery.isFetchingNextPage ? (
                <Loader2 aria-hidden="true" className="animate-spin" />
              ) : null}
              Carregar mensagens anteriores
            </Button>
          </div>
        ) : null}

        <ul className="flex flex-col gap-3">
          {messages.map((message) => {
            const day = dayKey(message.createdAt)
            const showDay = day !== lastDay
            lastDay = day

            return (
              <Fragment key={message.id}>
                {showDay ? (
                  <li className="my-2 flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                      {formatDayLabel(message.createdAt)}
                    </span>
                  </li>
                ) : null}

                <MessageBubble
                  message={message}
                  isOwn={message.userId === user?.id}
                  isRead={(partner?.lastReadMessageId ?? 0) >= message.id}
                  currentUserId={user?.id}
                  onReply={setReplyTo}
                  onToggleReaction={(target, emoji) =>
                    void toggleReaction(target, emoji)
                  }
                />
              </Fragment>
            )
          })}
        </ul>

        {messages.length === 0 && !messagesQuery.isPending ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Diga olá e conte o que você precisa.
          </p>
        ) : null}

        {isPartnerTyping ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {partner?.user?.name ?? 'Usuário'} está digitando…
          </p>
        ) : null}
      </div>

      <MessageComposer
        replyTo={replyTo}
        isSending={isSending}
        onCancelReply={() => setReplyTo(null)}
        onSend={send}
        onTyping={(isTyping) => sendTyping(conversationId, isTyping)}
      />
    </section>
  )
}
