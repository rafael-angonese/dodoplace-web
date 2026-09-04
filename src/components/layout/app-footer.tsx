import { Link } from '@tanstack/react-router'

import { LogoLockup } from '@/components/brand/logo'

const FOOTER_LINKS = [
  { to: '/', label: 'Buscar serviços' },
  { to: '/services', label: 'Categorias' },
  { to: '/publish', label: 'Publicar serviço' },
  { to: '/favorites', label: 'Favoritos' },
  { to: '/about', label: 'Sobre' },
] as const

export function AppFooter() {
  return (
    <footer className="bg-dodo-blue text-white dark:bg-dodo-blue-deep">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <Link to="/" aria-label="DodoPlace" className="inline-flex">
            <LogoLockup onDark className="h-10" />
          </Link>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Marketplace de serviços para encontrar quem faz perto de você.
          </p>
          <p className="mt-6 font-display text-lg font-extrabold text-dodo-orange">
            Encontre quem faz.
          </p>
        </div>

        <nav
          aria-label="Rodapé"
          className="flex flex-col gap-3 font-display text-sm font-bold"
        >
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-white/75 transition-colors hover:text-dodo-orange"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/50 md:px-6">
          © {new Date().getFullYear()} DodoPlace. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
