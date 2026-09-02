import { Link } from '@tanstack/react-router'

import { CategoryIcon } from '@/components/discovery/category-icon'
import type { ServiceCategory } from '@/lib/categories'
import { cn } from '@/utils/cn'

export function CategoryCarousel({
  categories,
  activeSlug,
}: {
  categories: ServiceCategory[]
  activeSlug?: string
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 md:mx-0 md:px-0">
      {categories.map((category) => {
        const isActive = category.slug === activeSlug

        return (
          <Link
            key={category.id}
            to="/"
            search={(current) => ({
              ...current,
              category: isActive ? undefined : category.slug,
            })}
            className={cn(
              'group flex w-20 shrink-0 flex-col items-center gap-2 border-b-2 pb-2.5 text-center transition-colors',
              isActive
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-surface-muted transition group-hover:bg-brand-yellow/30">
              <CategoryIcon name={category.icon} className="size-5" />
            </span>
            <span className="text-[11px] leading-tight font-semibold">
              {category.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
