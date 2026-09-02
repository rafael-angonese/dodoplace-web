import { Link } from '@tanstack/react-router'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { Button } from '@/components/ui/button'
import type { ServiceCategory } from '@/lib/categories'
import { toggleCategory } from '@/lib/service-search'
import { cn } from '@/utils/cn'

const SCROLL_RATIO = 0.8

const EDGE_THRESHOLD = 4

function ScrollButton({
  side,
  onClick,
}: {
  side: 'left' | 'right'
  onClick: () => void
}) {
  const isLeft = side === 'left'

  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 hidden w-14 from-background to-transparent md:block',
          isLeft ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l',
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={
          isLeft ? 'Ver categorias anteriores' : 'Ver mais categorias'
        }
        className={cn(
          'absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 rounded-full bg-background shadow-md md:inline-flex',
          isLeft ? 'left-0' : 'right-0',
        )}
        onClick={onClick}
      >
        {isLeft ? (
          <ChevronLeft aria-hidden="true" />
        ) : (
          <ChevronRight aria-hidden="true" />
        )}
      </Button>
    </>
  )
}

export function CategoryCarousel({
  categories,
  activeSlugs,
}: {
  categories: ServiceCategory[]
  activeSlugs: string[]
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const sync = useCallback(() => {
    const node = scrollerRef.current

    if (!node) {
      return
    }

    setCanScrollLeft(node.scrollLeft > EDGE_THRESHOLD)
    setCanScrollRight(
      node.scrollLeft + node.clientWidth < node.scrollWidth - EDGE_THRESHOLD,
    )
  }, [])

  useEffect(() => {
    const node = scrollerRef.current

    if (!node || categories.length === 0) {
      return
    }

    sync()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(sync)
    observer.observe(node)

    return () => observer.disconnect()
  }, [sync, categories.length])

  function scrollStep(direction: -1 | 1) {
    const node = scrollerRef.current

    if (!node) {
      return
    }

    node.scrollBy({
      left: direction * node.clientWidth * SCROLL_RATIO,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={sync}
        className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pt-1.5 md:-mx-1 md:px-1"
      >
        {categories.map((category) => {
          const isActive = activeSlugs.includes(category.slug)

          return (
            <Link
              key={category.id}
              to="/"
              search={(current) => ({
                ...current,
                category: toggleCategory(current.category, category.slug),
              })}
              aria-pressed={isActive}
              className={cn(
                'group flex w-20 shrink-0 flex-col items-center gap-2 border-b-2 pb-2.5 text-center transition-colors',
                isActive
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              <span className="relative">
                <span
                  className={cn(
                    'grid size-11 place-items-center rounded-2xl transition',
                    isActive
                      ? 'bg-brand-yellow/40'
                      : 'bg-surface-muted group-hover:bg-brand-yellow/30',
                  )}
                >
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>

                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-foreground text-background"
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                ) : null}
              </span>

              <span className="text-[11px] leading-tight font-semibold">
                {category.name}
              </span>
            </Link>
          )
        })}
      </div>

      {canScrollLeft ? (
        <ScrollButton side="left" onClick={() => scrollStep(-1)} />
      ) : null}

      {canScrollRight ? (
        <ScrollButton side="right" onClick={() => scrollStep(1)} />
      ) : null}
    </div>
  )
}
