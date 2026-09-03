import { Play } from 'lucide-react'
import { useState } from 'react'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { ServicePhoto } from '@/lib/services'
import { cn } from '@/utils/cn'

function Thumbnail({
  photo,
  title,
  eager,
}: {
  photo: ServicePhoto
  title: string
  eager?: boolean
}) {
  if (photo.kind === 'video') {
    return (
      <span className="relative block size-full">
        <video
          src={photo.url ?? ''}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover transition hover:brightness-95"
        >
          <track kind="captions" />
        </video>
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 text-white">
          <Play aria-hidden="true" className="size-8" />
        </span>
      </span>
    )
  }

  return (
    <img
      src={photo.url ?? ''}
      alt={title}
      loading={eager ? 'eager' : 'lazy'}
      className="size-full object-cover transition hover:brightness-95"
    />
  )
}

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
          <Thumbnail photo={cover} title={title} eager />
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
                <Thumbnail photo={photo} title={title} />
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
              <Thumbnail photo={photo} title={title} />
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
          {active === null ? null : active.kind === 'video' ? (
            <video
              src={active.url ?? ''}
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] w-full rounded-lg object-contain"
            >
              <track kind="captions" />
            </video>
          ) : (
            <img
              src={active.url ?? ''}
              alt={title}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
