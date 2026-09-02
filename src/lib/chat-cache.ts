import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type { CursorPage, Paginated } from '@/lib/api'
import type {
  ChatMessage,
  ChatMessageSummary,
  Conversation,
  MessageReaction,
} from '@/lib/chat'
import type { ChatSocketEvent, PresenceStatus } from '@/lib/chat-socket'
import { chatKeys } from '@/lib/queries'

type MessagesData = InfiniteData<CursorPage<ChatMessage>, string | null>

type ConversationsData = Paginated<Conversation>

function toSummary(message: ChatMessage): ChatMessageSummary {
  return {
    id: message.id,
    conversationId: message.conversationId,
    userId: message.userId,
    body: message.body,
    author: message.author,
    attachments: message.attachments,
    createdAt: message.createdAt,
  }
}

function mapMessages(
  data: MessagesData | undefined,
  transform: (message: ChatMessage) => ChatMessage,
) {
  if (!data) {
    return data
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.map(transform),
    })),
  }
}

function patchConversationLists(
  queryClient: QueryClient,
  transform: (conversation: Conversation) => Conversation,
) {
  for (const query of queryClient
    .getQueryCache()
    .findAll({ queryKey: chatKeys.conversationsRoot })) {
    queryClient.setQueryData<ConversationsData>(query.queryKey, (current) =>
      current ? { ...current, data: current.data.map(transform) } : current,
    )
  }
}

export function appendMessage(
  queryClient: QueryClient,
  conversationId: number,
  message: ChatMessage,
) {
  queryClient.setQueryData<MessagesData>(
    chatKeys.messages(conversationId),
    (current) => {
      if (!current) {
        return current
      }

      const known = current.pages.some((page) =>
        page.data.some((item) => item.id === message.id),
      )

      if (known) {
        return mapMessages(current, (item) =>
          item.id === message.id ? message : item,
        )
      }

      return {
        ...current,
        pages: current.pages.map((page, index) =>
          index === 0 ? { ...page, data: [...page.data, message] } : page,
        ),
      }
    },
  )
}

function bumpConversation(
  queryClient: QueryClient,
  message: ChatMessage,
  currentUserId: number | undefined,
) {
  const lists = queryClient
    .getQueryCache()
    .findAll({ queryKey: chatKeys.conversationsRoot })

  let known = false

  for (const query of lists) {
    queryClient.setQueryData<ConversationsData>(query.queryKey, (current) => {
      const target = current?.data.find(
        (conversation) => conversation.id === message.conversationId,
      )

      if (!current || !target) {
        return current
      }

      known = true

      const updated: Conversation = {
        ...target,
        lastMessage: toSummary(message),
        lastMessageAt: message.createdAt,
        unreadCount:
          message.userId === currentUserId
            ? target.unreadCount
            : target.unreadCount + 1,
      }

      return {
        ...current,
        data: [
          updated,
          ...current.data.filter(
            (conversation) => conversation.id !== message.conversationId,
          ),
        ],
      }
    })
  }

  if (!known) {
    void queryClient.invalidateQueries({
      queryKey: chatKeys.conversationsRoot,
    })
  }
}

export function setMessageReactions(
  queryClient: QueryClient,
  conversationId: number,
  messageId: number,
  reactions: MessageReaction[],
) {
  queryClient.setQueryData<MessagesData>(
    chatKeys.messages(conversationId),
    (current) =>
      mapMessages(current, (message) =>
        message.id === messageId ? { ...message, reactions } : message,
      ),
  )
}

function applyRead(
  queryClient: QueryClient,
  conversationId: number,
  userId: number,
  lastReadMessageId: number | null,
  lastReadAt: string,
  currentUserId: number | undefined,
) {
  const patch = (conversation: Conversation): Conversation => ({
    ...conversation,
    unreadCount:
      userId === currentUserId ? 0 : conversation.unreadCount,
    participants: conversation.participants.map((participant) =>
      participant.userId === userId
        ? { ...participant, lastReadMessageId, lastReadAt }
        : participant,
    ),
  })

  patchConversationLists(queryClient, (conversation) =>
    conversation.id === conversationId ? patch(conversation) : conversation,
  )

  queryClient.setQueryData<Conversation>(
    chatKeys.conversation(conversationId),
    (current) => (current ? patch(current) : current),
  )
}

function applyPresence(queryClient: QueryClient, status: PresenceStatus) {
  const patch = (conversation: Conversation): Conversation => ({
    ...conversation,
    participants: conversation.participants.map((participant) =>
      participant.userId === status.userId
        ? {
            ...participant,
            isOnline: status.isOnline,
            lastSeenAt: status.lastSeenAt,
          }
        : participant,
    ),
  })

  patchConversationLists(queryClient, patch)

  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['chat', 'conversation'] })
    .forEach((query) => {
      queryClient.setQueryData<Conversation>(query.queryKey, (current) =>
        current ? patch(current) : current,
      )
    })
}

export function applyChatEvent(
  queryClient: QueryClient,
  event: ChatSocketEvent,
  currentUserId: number | undefined,
) {
  if (event.type === 'message.created') {
    appendMessage(queryClient, event.conversationId, event.message)
    bumpConversation(queryClient, event.message, currentUserId)

    if (event.message.userId !== currentUserId) {
      void queryClient.invalidateQueries({ queryKey: chatKeys.unread })
    }

    return
  }

  if (event.type === 'message.reactions') {
    setMessageReactions(
      queryClient,
      event.conversationId,
      event.messageId,
      event.reactions,
    )
    return
  }

  if (event.type === 'conversation.read') {
    applyRead(
      queryClient,
      event.conversationId,
      event.userId,
      event.lastReadMessageId,
      event.lastReadAt,
      currentUserId,
    )

    if (event.userId === currentUserId) {
      void queryClient.invalidateQueries({ queryKey: chatKeys.unread })
    }

    return
  }

  if (event.type === 'presence') {
    applyPresence(queryClient, {
      userId: event.userId,
      isOnline: event.isOnline,
      lastSeenAt: event.lastSeenAt,
    })
    return
  }

  if (event.type === 'presence.snapshot') {
    for (const status of event.presence) {
      applyPresence(queryClient, status)
    }
  }
}
