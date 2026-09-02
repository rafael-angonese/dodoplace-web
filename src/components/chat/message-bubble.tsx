import { Check, CheckCheck, Reply } from 'lucide-react'

import { MessageAttachments } from '@/components/chat/message-attachments'
import {
  ReactionChips,
  ReactionPicker,
  groupReactions,
} from '@/components/chat/message-reactions'
import { Button } from '@/components/ui/button'
import type { ChatMessage } from '@/lib/chat'
import { formatMessageTime } from '@/lib/format'
import { cn } from '@/utils/cn'

function ReplyPreview({ message }: { message: ChatMessage['replyTo'] }) {
  if (!message) {
    return null
  }

  return (
    <div className="mb-2 rounded-lg border-l-2 border-current/40 bg-black/5 px-2 py-1 text-xs opacity-80 dark:bg-white/10">
      <p className="font-semibold">
        {message.author?.name ?? 'Mensagem'}
      </p>
      <p className="line-clamp-2">
        {message.body ??
          (message.attachments?.[0]?.type === 'video' ? 'Vídeo' : 'Foto')}
      </p>
    </div>
  )
}

export function MessageBubble({
  message,
  isOwn,
  isRead,
  currentUserId,
  onReply,
  onToggleReaction,
}: {
  message: ChatMessage
  isOwn: boolean
  isRead: boolean
  currentUserId: number | undefined
  onReply: (message: ChatMessage) => void
  onToggleReaction: (message: ChatMessage, emoji: string) => void
}) {
  const groups = groupReactions(message.reactions ?? [], currentUserId)

  return (
    <li
      className={cn(
        'group flex items-end gap-1',
        isOwn ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <div className={cn('flex max-w-[80%] flex-col', isOwn && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm shadow-xs',
            isOwn
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted text-foreground',
          )}
        >
          <ReplyPreview message={message.replyTo} />

          {message.attachments && message.attachments.length > 0 ? (
            <div className="mb-2">
              <MessageAttachments attachments={message.attachments} />
            </div>
          ) : null}

          {message.body ? (
            <p className="whitespace-pre-wrap">{message.body}</p>
          ) : null}

          <div className="mt-1 flex items-center justify-end gap-1 text-[11px] opacity-70">
            <time dateTime={message.createdAt}>
              {formatMessageTime(message.createdAt)}
            </time>
            {isOwn ? (
              isRead ? (
                <CheckCheck aria-label="Visualizada" className="size-3.5" />
              ) : (
                <Check aria-label="Enviada" className="size-3.5" />
              )
            ) : null}
          </div>
        </div>

        <ReactionChips
          groups={groups}
          onToggle={(emoji) => onToggleReaction(message, emoji)}
        />
      </div>

      <div className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <ReactionPicker
          onSelect={(emoji) => onToggleReaction(message, emoji)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full"
          aria-label="Responder mensagem"
          onClick={() => onReply(message)}
        >
          <Reply aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </li>
  )
}
