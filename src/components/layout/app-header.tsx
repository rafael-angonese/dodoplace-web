import { Link } from '@tanstack/react-router'
import { Heart, MessagesSquare } from 'lucide-react'

import { Logo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-context'
import { useChat } from '@/providers/chat-context'

const NAV_ITEMS = [
  { to: '/', label: 'Buscar', exact: true },
  { to: '/services', label: 'Categorias', exact: false },
] as const

function ChatButton() {
  const { status } = useAuth()
  const { unreadTotal } = useChat()

  if (status !== 'authenticated') {
    return null
  }

  return (
    <Button asChild variant="ghost" size="icon" className="relative rounded-full">
      <Link to="/chats" aria-label="Conversas">
        <MessagesSquare aria-hidden="true" />
        {unreadTotal > 0 ? (
          <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-dodo-orange px-1 font-display text-[10px] font-extrabold text-dodo-blue-deep">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo className="h-9 md:h-10" />

        <nav
          aria-label="Principal"
          className="hidden items-center gap-6 font-display text-sm font-bold md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="rounded-md py-1 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: 'text-primary dark:text-dodo-orange' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Button
            asChild
            variant="brand"
            size="sm"
            className="hidden h-10 px-5 text-sm md:inline-flex"
          >
            <Link to="/publish">Publicar serviço</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden rounded-full md:inline-flex"
          >
            <Link to="/favorites" aria-label="Favoritos">
              <Heart aria-hidden="true" />
            </Link>
          </Button>

          <ChatButton />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
