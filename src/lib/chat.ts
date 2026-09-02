import {
  type CursorPage,
  type Paginated,
  apiCursorPage,
  apiPaginated,
  apiRequest,
  toQueryString,
} from '@/lib/api'
import type { Service } from '@/lib/services'

export const MESSAGE_REACTIONS = [
  '👍',
  '❤️',
  '😂',
  '😮',
  '😢',
  '🙏',
  '🔥',
  '👏',
] as const

export type MessageReactionEmoji = (typeof MESSAGE_REACTIONS)[number]

export const MESSAGE_ATTACHMENTS_MAX_COUNT = 5

export const MESSAGE_IMAGE_MAX_BYTES = 10 * 1024 * 1024

export const MESSAGE_VIDEO_MAX_BYTES = 20 * 1024 * 1024

export type ChatUser = {
  id: number
  name: string | null
  avatarUrl: string | null
  initials: string
  headline: string | null
  createdAt: string
}

export type MessageAttachment = {
  id: number
  type: 'image' | 'video'
  url: string | null
  mimeType: string | null
  sizeBytes: number | null
}

export type MessageReaction = {
  id: number
  messageId: number
  userId: number
  emoji: string
  createdAt: string
}

export type ChatMessageSummary = {
  id: number
  conversationId: number
  userId: number
  body: string | null
  author?: ChatUser
  attachments?: MessageAttachment[]
  createdAt: string
}

export type ChatMessage = {
  id: number
  conversationId: number
  userId: number
  body: string | null
  replyToId: number | null
  author?: ChatUser
  replyTo?: ChatMessageSummary | null
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  createdAt: string
  updatedAt: string | null
}

export type ConversationParticipant = {
  id: number
  userId: number
  lastReadMessageId: number | null
  lastReadAt: string | null
  isOnline: boolean
  lastSeenAt: string | null
  user?: ChatUser
}

export type Conversation = {
  id: number
  serviceId: number | null
  unreadCount: number
  lastMessageAt: string | null
  participants: ConversationParticipant[]
  lastMessage: ChatMessageSummary | null
  service?: Service
  createdAt: string
  updatedAt: string | null
}

export type StartConversationInput = {
  recipientId: number
  serviceId?: number | null
}

export type SendMessageInput = {
  body?: string | null
  replyToId?: number | null
  attachments?: File[]
}

export function otherParticipant(
  conversation: Conversation,
  currentUserId: number | undefined,
) {
  return (
    conversation.participants.find(
      (participant) => participant.userId !== currentUserId,
    ) ?? conversation.participants[0]
  )
}

export function participantOf(
  conversation: Conversation,
  userId: number | undefined,
) {
  return conversation.participants.find(
    (participant) => participant.userId === userId,
  )
}

export const chatApi = {
  conversations(
    token: string,
    params: { q?: string; page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<Conversation>> {
    return apiPaginated<Conversation>(
      `/chat/conversations${toQueryString(params)}`,
      { token, signal },
    )
  },

  conversation(token: string, id: number, signal?: AbortSignal) {
    return apiRequest<Conversation>(`/chat/conversations/${id}`, {
      token,
      signal,
    })
  },

  start(token: string, input: StartConversationInput) {
    return apiRequest<Conversation>('/chat/conversations', {
      method: 'POST',
      body: input,
      token,
    })
  },

  messages(
    token: string,
    conversationId: number,
    params: { before?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<CursorPage<ChatMessage>> {
    return apiCursorPage<ChatMessage>(
      `/chat/conversations/${conversationId}/messages${toQueryString(params)}`,
      { token, signal },
    )
  },

  sendMessage(token: string, conversationId: number, input: SendMessageInput) {
    const path = `/chat/conversations/${conversationId}/messages`
    const attachments = input.attachments ?? []

    if (attachments.length === 0) {
      return apiRequest<ChatMessage>(path, {
        method: 'POST',
        body: { body: input.body ?? null, replyToId: input.replyToId ?? null },
        token,
      })
    }

    const body = new FormData()

    for (const attachment of attachments) {
      body.append('attachments[]', attachment)
    }

    if (input.body) {
      body.append('body', input.body)
    }

    if (input.replyToId) {
      body.append('replyToId', String(input.replyToId))
    }

    return apiRequest<ChatMessage>(path, { method: 'POST', body, token })
  },

  markRead(token: string, conversationId: number, messageId?: number | null) {
    return apiRequest<ConversationParticipant>(
      `/chat/conversations/${conversationId}/read`,
      { method: 'POST', body: { messageId: messageId ?? null }, token },
    )
  },

  react(token: string, messageId: number, emoji: string) {
    return apiRequest<MessageReaction[]>(`/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      body: { emoji },
      token,
    })
  },

  unreact(token: string, messageId: number, emoji: string) {
    return apiRequest<MessageReaction[]>(
      `/chat/messages/${messageId}/reactions${toQueryString({ emoji })}`,
      { method: 'DELETE', token },
    )
  },

  unread(token: string, signal?: AbortSignal) {
    return apiRequest<{ total: number }>('/chat/unread', { token, signal })
  },
}
