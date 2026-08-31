import { Link } from '@tanstack/react-router'

import { Logo } from '@/components/brand/logo'

const FOOTER_LINKS = [
  { to: '/buscar', label: 'Buscar' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/profissionais', label: 'Profissionais' },
] as const

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Marketplace de serviços para encontrar profissionais perto de você.
          </p>
        </div>

        <nav
          aria-label="Rodapé"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium"
        >
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
