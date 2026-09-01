import { Link } from '@tanstack/react-router'

import { Logo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'

const NAV_ITEMS = [
  { to: '/buscar', label: 'Buscar' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/profissionais', label: 'Profissionais' },
] as const

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo className="text-xl" />

        <nav
          aria-label="Principal"
          className="hidden items-center gap-5 text-sm font-medium md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md py-1 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: 'font-semibold text-foreground' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
