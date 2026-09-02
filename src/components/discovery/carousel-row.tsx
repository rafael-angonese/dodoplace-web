import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

export function CarouselRow({
  children,
  className,
  itemClassName,
  header,
}: {
  children: React.ReactNode
  className?: string
  itemClassName?: string
  header?: React.ReactNode
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const sync = useCallback(() => {
    const node = scrollerRef.current

    if (!node) {
      return
    }

    setCanScrollLeft(node.scrollLeft > 8)
    setCanScrollRight(
      node.scrollLeft + node.clientWidth < node.scrollWidth - 8,
    )
  }, [])

  useEffect(() => {
    sync()

    const node = scrollerRef.current

    if (!node) {
      return
    }

    const observer = new ResizeObserver(sync)
    observer.observe(node)

    return () => observer.disconnect()
  }, [sync])

  function scrollBy(direction: 1 | -1) {
    const node = scrollerRef.current

    if (!node) {
      return
    }

    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-4">
        {header}

        <div className="hidden shrink-0 gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Voltar"
            className="grid size-8 place-items-center rounded-full border border-border transition hover:bg-accent disabled:opacity-30"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Avançar"
            className="grid size-8 place-items-center rounded-full border border-border transition hover:bg-accent disabled:opacity-30"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={sync}
        className={cn(
          'no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 md:mx-0 md:px-0',
          itemClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
