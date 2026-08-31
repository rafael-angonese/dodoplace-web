import { Link } from '@tanstack/react-router'
import { Wrench } from 'lucide-react'

import type { DiscoveryCategory } from '@/components/discovery/categories'
import { Card } from '@/components/ui/card'

export function CategoryGrid({
  categories,
}: {
  categories: DiscoveryCategory[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/buscar"
          search={{ categoria: category.slug }}
          className="rounded-2xl"
        >
          <Card className="h-full rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <Wrench aria-hidden="true" className="mb-3 size-5 text-brand-coral" />
            <span className="font-semibold">{category.name}</span>
          </Card>
        </Link>
      ))}
    </div>
  )
}
