import { Link, createFileRoute } from '@tanstack/react-router'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { SearchBar } from '@/components/discovery/search-bar'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { categoriesApi } from '@/lib/categories'

export const Route = createFileRoute('/servicos')({
  component: Servicos,
  head: () => ({ meta: [{ title: 'Categorias de serviços | FazPerto' }] }),
  loader: async () => ({ categories: await categoriesApi.list() }),
})

function Servicos() {
  const { categories } = Route.useLoaderData()

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        O que você precisa resolver?
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Escolha uma categoria e veja quem atende na sua região.
      </p>

      <div className="mt-6 max-w-3xl">
        <SearchBar variant="compact" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to="/"
            search={{ categoria: category.slug }}
            className="rounded-2xl"
          >
            <Card className="h-full rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-muted">
                <CategoryIcon
                  name={category.icon}
                  className="size-5 text-brand-coral"
                />
              </span>
              <span className="mt-3 block font-semibold">{category.name}</span>
              {category.description ? (
                <span className="mt-1 block text-sm text-muted-foreground">
                  {category.description}
                </span>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
