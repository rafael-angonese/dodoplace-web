import { API_BASE_URL } from '@/lib/api'
import type { ChatMessage, MessageReaction } from '@/lib/chat'

export type PresenceStatus = {
  userId: number
  isOnline: boolean
  lastSeenAt: string | null
}

export type ChatSocketEvent =
  | { type: 'connected'; userId: number }
  | { type: 'pong' }
  | { type: 'message.created'; conversationId: number; message: ChatMessage }
  | {
      type: 'message.reactions'
      conversationId: number
      messageId: number
      reactions: MessageReaction[]
    }
  | {
      type: 'conversation.read'
      conversationId: number
      userId: number
      lastReadMessageId: number | null
      lastReadAt: string
    }
  | {
      type: 'conversation.typing'
      conversationId: number
      userId: number
      isTyping: boolean
    }
  | ({ type: 'presence' } & PresenceStatus)
  | { type: 'presence.snapshot'; presence: PresenceStatus[] }

export type ChatSocketStatus = 'connecting' | 'open' | 'closed'

export type ChatSocketCommand =
  | { type: 'ping' }
  | { type: 'typing'; conversationId: number; isTyping: boolean }
  | { type: 'presence.query'; userIds: number[] }

const RECONNECT_DELAYS = [1_000, 2_000, 5_000, 10_000, 20_000]

const PING_INTERVAL = 25_000

export function chatSocketUrl(token: string) {
  const base = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '')

  return `${base}/ws/chat?token=${encodeURIComponent(token)}`
}

export class ChatSocket {
  #token: string
  #socket: WebSocket | null = null
  #listeners = new Set<(event: ChatSocketEvent) => void>()
  #statusListeners = new Set<(status: ChatSocketStatus) => void>()
  #status: ChatSocketStatus = 'closed'
  #attempts = 0
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null
  #pingTimer: ReturnType<typeof setInterval> | null = null
  #closed = false

  constructor(token: string) {
    this.#token = token
  }

  get status() {
    return this.#status
  }

  connect() {
    if (this.#closed || this.#socket) {
      return
    }

    this.#setStatus('connecting')

    const socket = new WebSocket(chatSocketUrl(this.#token))
    this.#socket = socket

    socket.onopen = () => {
      this.#attempts = 0
      this.#setStatus('open')
      this.#pingTimer = setInterval(() => this.send({ type: 'ping' }), PING_INTERVAL)
    }

    socket.onmessage = (event) => {
      let parsed: ChatSocketEvent

      try {
        parsed = JSON.parse(String(event.data)) as ChatSocketEvent
      } catch {
        return
      }

      for (const listener of this.#listeners) {
        listener(parsed)
      }
    }

    socket.onclose = () => {
      this.#teardownSocket()
      this.#setStatus('closed')
      this.#scheduleReconnect()
    }

    socket.onerror = () => {
      socket.close()
    }
  }

  close() {
    this.#closed = true

    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer)
      this.#reconnectTimer = null
    }

    const socket = this.#socket
    this.#teardownSocket()
    socket?.close()
    this.#setStatus('closed')
  }

  send(command: ChatSocketCommand) {
    if (this.#socket?.readyState === WebSocket.OPEN) {
      this.#socket.send(JSON.stringify(command))
    }
  }

  subscribe(listener: (event: ChatSocketEvent) => void) {
    this.#listeners.add(listener)

    return () => {
      this.#listeners.delete(listener)
    }
  }

  onStatusChange(listener: (status: ChatSocketStatus) => void) {
    this.#statusListeners.add(listener)

    return () => {
      this.#statusListeners.delete(listener)
    }
  }

  #teardownSocket() {
    if (this.#pingTimer) {
      clearInterval(this.#pingTimer)
      this.#pingTimer = null
    }

    if (this.#socket) {
      this.#socket.onopen = null
      this.#socket.onclose = null
      this.#socket.onerror = null
      this.#socket.onmessage = null
      this.#socket = null
    }
  }

  #scheduleReconnect() {
    if (this.#closed) {
      return
    }

    const delay =
      RECONNECT_DELAYS[Math.min(this.#attempts, RECONNECT_DELAYS.length - 1)]

    this.#attempts += 1
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null
      this.connect()
    }, delay)
  }

  #setStatus(status: ChatSocketStatus) {
    if (this.#status === status) {
      return
    }

    this.#status = status

    for (const listener of this.#statusListeners) {
      listener(status)
    }
  }
}
