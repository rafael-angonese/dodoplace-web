Welcome to your new TanStack Start app!

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`

## Páginas

O layout segue a estrutura do Airbnb: barra de busca em pílula (o quê + onde),
carrossel de categorias com ícone, cartões quadrados com foto, coração de
favorito, nota e preço, e uma página de detalhe em duas colunas com galeria,
avaliações e cartão de contato fixo.

| Rota | Arquivo | Conteúdo |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Hero + busca, categorias, carrosséis por categoria, "como funciona", CTAs |
| `/buscar` | `src/routes/buscar.tsx` | Resultados em grade, filtros, ordenação, paginação |
| `/servicos` | `src/routes/servicos.tsx` | Grade com todas as categorias |
| `/servicos/$serviceId` | `src/routes/servicos_.$serviceId.tsx` | Detalhe do serviço: galeria, descrição, profissional, avaliações |
| `/perfil/$userId` | `src/routes/perfil.$userId.tsx` | Perfil público com contatos e todos os serviços da pessoa |
| `/publicar` | `src/routes/publicar.tsx` | Formulário de criação de serviço |
| `/favoritos` | `src/routes/favoritos.tsx` | Serviços salvos |
| `/conta` | `src/routes/conta.tsx` | Perfil: nome, chamada, bio, cidade, WhatsApp, Instagram, site, avatar |
| `/conta/servicos` | `src/routes/conta_.servicos.tsx` | Meus anúncios: publicar/despublicar, editar, excluir |
| `/conta/servicos/$serviceId` | `src/routes/conta_.servicos_.$serviceId.tsx` | Edição do serviço + gerenciador de fotos |

O chrome (`AppHeader`, `AppFooter`, `MobileNav`) vive em `src/components/layout/`
e é montado no `__root.tsx`. As peças de descoberta estão em
`src/components/discovery/`, as do serviço em `src/components/service/` e o
seletor de cidade em `src/components/location/`.

### Localização e geolocalização

`location-context.tsx` guarda a cidade escolhida em `localStorage` e expõe
`detectCity()`, que usa `navigator.geolocation` e envia as coordenadas para
`GET /locations/cities/nearby` — a API devolve a cidade mais próxima do banco de
municípios do IBGE (5.571 cidades com centroide). O `LocationPicker` mostra
"Perto de você" no topo da lista, como o Airbnb, e cai para a escolha manual
quando a permissão é negada.

Em `/buscar` a URL é a fonte da verdade: o `cidadeId` do endereço define o que
aparece e o que o seletor exibe. Ao chegar na rota sem `cidadeId`, a cidade
salva é aplicada uma vez; remover o chip da cidade volta para "Qualquer lugar".

### Favoritos

`providers/favorites-context.tsx` carrega os ids favoritados uma vez
(`GET /account/favorites/ids`) e faz o toggle otimista, então o coração responde
na hora em qualquer lugar da interface. Sem sessão, o coração manda para
`/entrar`.

## Autenticação e integração com a API

O front consome a API AdonisJS em `../api` (`http://localhost:3333/api/v1` por
padrão, configurável em `VITE_API_URL` — veja `.env.example`).

**Não há senha.** O acesso é por magic link: o usuário informa o e-mail, recebe
um link de uso único e entra ao abri-lo. A conta só é criada quando o link é
aberto, então nenhum cadastro não verificado fica no banco.

| Rota | Arquivo | O que faz |
| --- | --- | --- |
| `/cadastro` | `src/routes/cadastro.tsx` | nome + e-mail → `POST /auth/magic-link` |
| `/entrar` | `src/routes/entrar.tsx` | e-mail → `POST /auth/magic-link` |
| `/entrar/verificar` | `src/routes/entrar_.verificar.tsx` | `POST /auth/verify` → abre a sessão |
| `/conta` | `src/routes/conta.tsx` | `GET`/`PUT /account/profile`, `POST /account/logout` |

As camadas de dados do marketplace ficam em `src/lib/`: `services.ts` (busca,
CRUD, fotos, favoritos, avaliações, feed da home), `categories.ts`,
`locations.ts` e `format.ts` (preço, nota, distância, link de WhatsApp).
`api.ts` expõe `apiRequest` (desembrulha `{ data }`), `apiPaginated`
(`{ data, metadata }`) e `toQueryString`.

Camadas:

- `src/lib/api.ts` — `fetch` com base URL, bearer token, desembrulho do envelope
  `{ data }` e `ApiError` (expõe `fieldErrors` e `generalMessage`).
- `src/lib/auth.ts` — endpoints tipados e o tipo `User`.
- `src/lib/auth-storage.ts` — token no `localStorage`, tolerante a SSR.
- `src/providers/auth-context.tsx` — `useAuth()` com `status`, `user`,
  `requestMagicLink`, `verifyMagicLink`, `signOut`, `updateProfile`.

O `status` começa em `loading` no SSR e no primeiro render do cliente, porque o
token só existe no `localStorage`; sem isso o HTML do servidor divergiria na
hidratação. `/conta` redireciona para `/entrar?redirect=/conta` quando não há
sessão, e `/entrar` e `/cadastro` mandam para `/conta` quando já há.

O nome informado no cadastro só é aproveitado se a conta ainda não existe — não
dá para sobrescrever o nome de outra pessoa pedindo um link para o e-mail dela.

### Desenvolvimento sem caixa de entrada

Enquanto a API estiver sem `RESEND_API_KEY`, ela devolve o link em `devUrl` e a
tela "Confira seu e-mail" o exibe num alerta. Assim que a chave é configurada o
campo some da resposta — ele nunca aparece em produção.

### Validação de formulários

Zod + `zodResolver` do `@hookform/resolvers`, com os schemas em
`src/lib/validation.ts` espelhando os validators VineJS da API. A API continua
sendo a fonte de verdade: os erros que só ela conhece voltam no formato
`{ errors: [{ message, field }] }` e o `src/lib/form-errors.ts` os distribui nos
campos via `setError` (`applyApiErrors`) ou devolve a mensagem solta para telas
sem formulário (`apiErrorMessage`).

## UI Kit (shadcn-style)

`src/components/ui/` holds a shadcn/ui-style component kit ported from the
`loytrustweb` app in the `trust` monorepo, so both products share one look.

- **Tokens** live in `src/styles/ui.css` (`--primary`, `--background`, `--danger`,
  `--radius`, shadows, …) and are exposed to Tailwind through `@theme inline`.
  `src/styles.css` imports it, along with `tw-animate-css` for the
  `animate-in` / `fade-in-0` utilities the overlay components use.
- **Dark mode** is class-based: `@custom-variant dark (&:where(.dark, .dark *))`.
  `src/providers/theme-context.tsx` owns the `light | dark | system` state and
  writes the `.dark` class onto `<html>`; the blocking script in
  `src/routes/__root.tsx` applies it before first paint to avoid a flash.
- **`cn()`** (clsx + tailwind-merge) lives in `src/utils/cn.ts`.
- **Brand:** `src/styles/brand.css` loads after `ui.css` and re-points the shadcn
  tokens at the DodoPlace palette from the *Guia de Identidade Visual v1.0*:
  Azul Dodo `#002E4C` as `--primary`, Laranja Dodo `#FEB20C` as the action
  colour, Ink `#102B3A` for text, Surface `#F4F7F9` and Border `#DDE5EA`. It
  exposes `bg-dodo-blue` / `bg-dodo-orange` / `text-dodo-ink` /
  `bg-surface-muted` and friends.
  - Orange is a *fill* on light backgrounds (buttons, badges, avatars) and a
    *text* colour only on the deep blue; blue carries structure, links and
    primary buttons.
  - Typography: **Nunito Sans** (`font-display`, applied to every heading and
    `Button`/`Badge`) for titles, campaigns and CTAs; **Inter** (`font-sans`)
    for interface copy and long text.
- **Logo:** official artwork only — never rebuild the wordmark from a font.
  `src/components/brand/logo.tsx` exposes `Logo` (linked lockup, swaps to the
  negative version under `.dark`), `LogoLockup` and `LogoMark` (isolated symbol,
  with `onDark` for the white variant). Files live in `public/brand/`.
- `src/routes/ui.tsx` (`/ui`) is a live gallery of the kit.

```tsx
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

;<Button variant="danger">
  <Icon name="trash2" />
  Excluir
</Button>
```

Files under `src/components/ui/` are kept byte-identical to the `trust` originals
(tab-indented, upstream lint quirks and all) so re-syncing is a plain diff.
`biome.json` has an `overrides` entry that relaxes the corresponding lint rules
for that directory only. The two intentional deviations are `link.tsx`
(TanStack Router's `createLink` instead of `react-router`) and `toaster.tsx`
(points at this app's theme provider).

Adding more components: copy them over from
`trust/packages/loytrustweb/src/components/ui/`, or run `npx shadcn@latest add <name>`
— `components.json` is configured with the `@/components/ui` and `@/utils/cn` aliases.

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
npm run lint
npm run format
npm run check
```


## Deploy with Nitro

This project uses Nitro as a generic server adapter, so it can run on any Node-compatible host.

```bash
npm run build
node dist/server/index.mjs
```

The build output is a self-contained Node server. To deploy, push the `dist/` directory to your host (Render, Fly.io, your own VPS, etc.) and run the server command above.

For host-specific presets (Vercel, Netlify, Cloudflare, AWS Lambda, etc.) and tuning, see https://v3.nitro.build/deploy.



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).


# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.


# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
