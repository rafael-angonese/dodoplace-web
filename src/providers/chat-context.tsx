import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { applyChatEvent } from '@/lib/chat-cache'
import {
  ChatSocket,
  type ChatSocketEvent,
  type ChatSocketStatus,
} from '@/lib/chat-socket'
import { unreadMessagesQueryOptions } from '@/lib/queries'
import { useAuth } from '@/providers/auth-context'

type ChatContextValue = {
  status: ChatSocketStatus
  unreadTotal: number
  subscribe: (listener: (event: ChatSocketEvent) => void) => () => void
  sendTyping: (conversationId: number, isTyping: boolean) => void
  queryPresence: (userIds: number[]) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { token, user } = useAuth()
  const [status, setStatus] = useState<ChatSocketStatus>('closed')
  const socketRef = useRef<ChatSocket | null>(null)
  const listenersRef = useRef(new Set<(event: ChatSocketEvent) => void>())

  const unreadQuery = useQuery({
    ...unreadMessagesQueryOptions(token ?? ''),
    enabled: Boolean(token),
  })

  useEffect(() => {
    if (!token) {
      setStatus('closed')
      return
    }

    const socket = new ChatSocket(token)
    socketRef.current = socket

    const offStatus = socket.onStatusChange(setStatus)
    const offEvents = socket.subscribe((event) => {
      applyChatEvent(queryClient, event, user?.id)

      for (const listener of listenersRef.current) {
        listener(event)
      }
    })

    socket.connect()

    return () => {
      offEvents()
      offStatus()
      socket.close()
      socketRef.current = null
    }
  }, [token, user?.id, queryClient])

  const subscribe = useCallback((listener: (event: ChatSocketEvent) => void) => {
    listenersRef.current.add(listener)

    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    socketRef.current?.send({ type: 'typing', conversationId, isTyping })
  }, [])

  const queryPresence = useCallback((userIds: number[]) => {
    if (userIds.length > 0) {
      socketRef.current?.send({ type: 'presence.query', userIds })
    }
  }, [])

  const value = useMemo<ChatContextValue>(
    () => ({
      status,
      unreadTotal: unreadQuery.data?.total ?? 0,
      subscribe,
      sendTyping,
      queryPresence,
    }),
    [status, unreadQuery.data?.total, subscribe, sendTyping, queryPresence],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return context
}
