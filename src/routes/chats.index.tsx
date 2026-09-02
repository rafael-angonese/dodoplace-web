import { createFileRoute } from '@tanstack/react-router'
import { MessagesSquare } from 'lucide-react'

export const Route = createFileRoute('/chats/')({
  component: ConversasIndex,
})

function ConversasIndex() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div className="max-w-sm space-y-2">
        <MessagesSquare
          aria-hidden="true"
          className="mx-auto size-10 text-muted-foreground"
        />
        <p className="font-semibold">Escolha uma conversa</p>
        <p className="text-sm text-muted-foreground">
          Suas mensagens com profissionais e clientes aparecem aqui, em tempo
          real.
        </p>
      </div>
    </div>
  )
}
