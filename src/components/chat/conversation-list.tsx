import { Link } from '@tanstack/react-router'

import { ChatAvatar } from '@/components/chat/chat-avatar'
import { MessageAttachments } from '@/components/chat/message-attachments'
import { Skeleton } from '@/components/ui/skeleton'
import { type Conversation, otherParticipant } from '@/lib/chat'
import { formatConversationTime } from '@/lib/format'
import { cn } from '@/utils/cn'

const SKELETON_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5']

function Preview({ conversation }: { conversation: Conversation }) {
  const message = conversation.lastMessage

  if (!message) {
    return (
      <span className="text-muted-foreground">Nenhuma mensagem ainda</span>
    )
  }

  const attachments = message.attachments ?? []

  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      {attachments.length > 0 ? (
        <MessageAttachments attachments={attachments} compact />
      ) : null}
      <span className="truncate">{message.body}</span>
    </span>
  )
}

export function ConversationListSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {SKELETON_KEYS.map((key) => (
        <li key={key} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ConversationList({
  conversations,
  currentUserId,
  activeId,
  search,
}: {
  conversations: Conversation[]
  currentUserId: number | undefined
  activeId?: number
  search?: string
}) {
  if (conversations.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted-foreground">
        {search
          ? `Nenhuma conversa com "${search}".`
          : 'Você ainda não tem conversas. Abra um serviço e fale com o profissional.'}
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {conversations.map((conversation) => {
        const partner = otherParticipant(conversation, currentUserId)
        const isActive = conversation.id === activeId

        return (
          <li key={conversation.id}>
            <Link
              to="/conversas/$conversationId"
              params={{ conversationId: String(conversation.id) }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent',
                isActive && 'bg-accent',
              )}
            >
              <ChatAvatar user={partner?.user} isOnline={partner?.isOnline} />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-semibold">
                    {partner?.user?.name ?? 'Usuário'}
                  </p>
                  <time className="shrink-0 text-[11px] text-muted-foreground">
                    {formatConversationTime(
                      conversation.lastMessageAt ?? conversation.createdAt,
                    )}
                  </time>
                </div>

                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    <Preview conversation={conversation} />
                  </span>

                  {conversation.unreadCount > 0 ? (
                    <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>

                {conversation.service ? (
                  <p className="truncate text-xs text-muted-foreground">
                    sobre: {conversation.service.title}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
