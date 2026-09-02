import { Link, useNavigate } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/providers/auth-context'

export function UserMenu() {
  const navigate = useNavigate()
  const { status, user, signOut } = useAuth()

  if (status === 'loading') {
    return <Skeleton className="h-10 w-20 rounded-xl" />
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <Button asChild variant="outline" size="sm" className="h-10">
        <Link to="/signin">Entrar</Link>
      </Button>
    )
  }

  async function onSignOut() {
    await signOut()
    navigate({ to: '/', replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 px-2"
          aria-label="Abrir menu da conta"
        >
          <Avatar className="size-8">
            {user.avatarUrl ? (
              <AvatarImage
                src={user.avatarUrl}
                alt={user.name ?? user.email}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-brand-yellow text-xs font-extrabold text-[#202124]">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">
            {user.name ?? user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">Meu perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/services">Meus serviços</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/chats">Conversas</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites">Favoritos</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/publish">Publicar serviço</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>Sair da conta</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
