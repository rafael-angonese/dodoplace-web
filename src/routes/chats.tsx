import { useQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import {
  ConversationList,
  ConversationListSkeleton,
} from '@/components/chat/conversation-list'
import { Heading } from '@/components/ui/heading'
import { InputSearch } from '@/components/ui/input-search'
import { conversationsQueryOptions } from '@/lib/queries'
import { useAuth } from '@/providers/auth-context'
import { useChat } from '@/providers/chat-context'
import { cn } from '@/utils/cn'

export const Route = createFileRoute('/chats')({
  component: Conversas,
  head: () => ({ meta: [{ title: 'Conversas | DodoPlace' }] }),
})

function Conversas() {
  const navigate = useNavigate()
  const { status, token, user } = useAuth()
  const { status: socketStatus } = useChat()
  const params = useParams({ strict: false })
  const activeId = params.conversationId
    ? Number(params.conversationId)
    : undefined

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({
        to: '/signin',
        search: { redirect: '/chats' },
        replace: true,
      })
    }
  }, [status, navigate])

  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(search.trim()), 300)

    return () => clearTimeout(timer)
  }, [search])

  const conversationsQuery = useQuery({
    ...conversationsQueryOptions(token ?? '', appliedSearch),
    enabled: Boolean(token),
  })

  return (
    <div className="mx-auto max-w-7xl px-0 md:px-6 md:py-6">
      <div className="grid h-[calc(100dvh-9rem)] grid-cols-1 overflow-hidden border-border md:h-[calc(100dvh-11rem)] md:grid-cols-[22rem_1fr] md:rounded-2xl md:border">
        <aside
          className={cn(
            'flex min-h-0 flex-col border-border md:flex md:border-r',
            activeId ? 'hidden' : 'flex',
          )}
        >
          <div className="space-y-3 border-b border-border px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <Heading variant="h2" className="text-xl font-extrabold">
                Conversas
              </Heading>
              <span className="text-xs text-muted-foreground">
                {socketStatus === 'open' ? 'tempo real ativo' : 'reconectando…'}
              </span>
            </div>

            <InputSearch
              value={search}
              placeholder="Buscar por nome"
              aria-label="Buscar conversas por nome"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversationsQuery.isPending ? (
              <ConversationListSkeleton />
            ) : (
              <ConversationList
                conversations={conversationsQuery.data?.data ?? []}
                currentUserId={user?.id}
                activeId={activeId}
                search={appliedSearch}
              />
            )}
          </div>
        </aside>

        <section
          className={cn(
            'min-h-0 md:block',
            activeId ? 'block' : 'hidden md:block',
          )}
        >
          <Outlet />
        </section>
      </div>
    </div>
  )
}
