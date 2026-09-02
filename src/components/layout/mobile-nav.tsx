import { Link } from '@tanstack/react-router'
import { Heart, Home, LayoutGrid, Plus, UserRound } from 'lucide-react'

import { cn } from '@/utils/cn'

const ITEM_CLASS =
  'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground'

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
          <ItemIcon icon={Home} />
          <span>Início</span>
        </Link>

        <Link
          to="/servicos"
          className={ITEM_CLASS}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={LayoutGrid} />
          <span>Categorias</span>
        </Link>

        <Link
          to="/publicar"
          className={ITEM_CLASS}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={Plus} primary />
          <span>Publicar</span>
        </Link>

        <Link
          to="/favoritos"
          className={ITEM_CLASS}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={Heart} />
          <span>Favoritos</span>
        </Link>

        <Link
          to="/conta"
          className={ITEM_CLASS}
          activeProps={{ className: 'text-foreground' }}
        >
          <ItemIcon icon={UserRound} />
          <span>Conta</span>
        </Link>
      </div>
    </nav>
  )
}
