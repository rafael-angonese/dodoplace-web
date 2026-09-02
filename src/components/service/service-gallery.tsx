import { useState } from 'react'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { ServicePhoto } from '@/lib/services'
import { cn } from '@/utils/cn'

export function ServiceGallery({
  photos,
  title,
  categoryIcon,
}: {
  photos: ServicePhoto[]
  title: string
  categoryIcon: string
}) {
  const [active, setActive] = useState<ServicePhoto | null>(null)

  if (photos.length === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-surface-muted md:aspect-auto md:h-[420px]">
        <CategoryIcon
          name={categoryIcon}
          className="size-14 text-muted-foreground/40"
        />
      </div>
    )
  }

  const [cover, ...rest] = photos
  const secondary = rest.slice(0, 4)
  const extra = rest.slice(4)

  return (
    <>
      <div className="grid gap-2 overflow-hidden rounded-2xl md:h-[420px] md:grid-cols-2">
        <button
          type="button"
          onClick={() => setActive(cover)}
          className="aspect-[4/3] overflow-hidden bg-surface-muted md:aspect-auto md:h-full"
        >
          <img
            src={cover.url ?? ''}
            alt={title}
            className="size-full object-cover transition hover:brightness-95"
          />
        </button>

        {secondary.length > 0 ? (
          <div
            className={cn(
              'grid gap-2 md:h-full',
              secondary.length === 1
                ? 'grid-cols-1'
                : secondary.length === 2
                  ? 'grid-cols-1 grid-rows-2'
                  : 'grid-cols-2 grid-rows-2',
            )}
          >
            {secondary.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActive(photo)}
                className="aspect-square overflow-hidden bg-surface-muted md:aspect-auto md:h-full"
              >
                <img
                  src={photo.url ?? ''}
                  alt={title}
                  loading="lazy"
                  className="size-full object-cover transition hover:brightness-95"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {extra.length > 0 ? (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {extra.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(photo)}
              className="size-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
            >
              <img
                src={photo.url ?? ''}
                alt={title}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog
        open={active !== null}
        onOpenChange={(open) => !open && setActive(null)}
      >
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {active ? (
            <img
              src={active.url ?? ''}
              alt={title}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
