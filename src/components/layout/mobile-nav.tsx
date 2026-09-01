import { Link } from '@tanstack/react-router'
import { Home, MessageCircle, Plus, Search, UserRound } from 'lucide-react'

import { cn } from '@/utils/cn'

const ITEM_CLASS =
  'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground'

const ROUTES = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/buscar', label: 'Buscar', icon: Search },
] as const

const PENDING = [
  { href: '/publicar', label: 'Publicar', icon: Plus, primary: true },
  { href: '/mensagens', label: 'Conversas', icon: MessageCircle },
] as const

function ItemIcon({
  icon: LucideIcon,
  primary,
}: {
  icon: typeof Home
  primary?: boolean
}) {
  return (
    <span
      className={cn(
        primary &&
          'grid size-10 place-items-center rounded-full bg-brand-yellow text-[#202124]',
      )}
    >
      <LucideIcon aria-hidden="true" className="size-5" />
    </span>
  )
}

export function MobileNav() {
  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background md:hidden"
    >
      <div className="grid grid-cols-5 items-end px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <Link
          to="/"
          className={ITEM_CLASS}
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={ROUTES[0].icon} />
          <span>{ROUTES[0].label}</span>
        </Link>

        <Link
          to="/buscar"
          className={ITEM_CLASS}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={ROUTES[1].icon} />
          <span>{ROUTES[1].label}</span>
        </Link>

        <Link
          to="/conta"
          className={`${ITEM_CLASS} order-last`}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={UserRound} />
          <span>Conta</span>
        </Link>

        {PENDING.map((item) => (
          <a key={item.label} href={item.href} className={ITEM_CLASS}>
            <ItemIcon icon={item.icon} primary={'primary' in item} />
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
