import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AppFooter } from '../components/layout/app-footer'
import { AppHeader } from '../components/layout/app-header'
import { MobileNav } from '../components/layout/mobile-nav'
import { LocationProvider } from '../components/location/location-context'
import { Toaster } from '../components/ui/toaster'
import { AuthProvider } from '../providers/auth-context'
import { ChatProvider } from '../providers/chat-context'
import { FavoritesProvider } from '../providers/favorites-context'
import { ThemeProvider } from '../providers/theme-context'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark')?stored:'system';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='system'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='system'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'DodoPlace | Encontre quem faz perto de você' },
      {
        name: 'description',
        content:
          'DodoPlace é o marketplace para encontrar profissionais e serviços perto de você.',
      },
      { name: 'theme-color', content: '#002E4C' },
      { name: 'apple-mobile-web-app-title', content: 'DodoPlace' },
      { property: 'og:site_name', content: 'DodoPlace' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'DodoPlace | Encontre quem faz perto de você' },
      {
        property: 'og:description',
        content:
          'DodoPlace é o marketplace para encontrar profissionais e serviços perto de você.',
      },
      { property: 'og:image', content: '/brand/dodoplace-og.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: '/brand/dodoplace-og.png' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              <FavoritesProvider>
                <LocationProvider>
                  <AppHeader />
                  <main className="min-h-[70vh] pb-20 md:pb-0">{children}</main>
                  <AppFooter />
                  <MobileNav />
                  <Toaster />
                </LocationProvider>
              </FavoritesProvider>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
