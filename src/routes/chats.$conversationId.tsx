import { createFileRoute, notFound } from '@tanstack/react-router'

import { MessageThread } from '@/components/chat/message-thread'

export const Route = createFileRoute('/chats/$conversationId')({
  component: ConversationRoute,
  loader: ({ params }) => {
    const id = Number(params.conversationId)

    if (!Number.isFinite(id) || id <= 0) {
      throw notFound()
    }

    return { conversationId: id }
  },
})

function ConversationRoute() {
  const { conversationId } = Route.useLoaderData()

  return (
    <MessageThread key={conversationId} conversationId={conversationId} />
  )
}
