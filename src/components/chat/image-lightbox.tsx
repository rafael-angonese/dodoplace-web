import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MessageAttachment } from '@/lib/chat'

export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: MessageAttachment[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  if (index === null || !images[index]) {
    return null
  }

  const currentIndex = index
  const current = images[currentIndex]

  function step(offset: number) {
    onIndexChange((currentIndex + offset + images.length) % images.length)
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="max-h-[95vh] w-auto max-w-[min(96vw,80rem)] overflow-visible border-0 bg-transparent p-0 shadow-none [&>button:last-child]:top-2 [&>button:last-child]:right-2 [&>button:last-child]:rounded-full [&>button:last-child]:bg-black/55 [&>button:last-child]:p-2 [&>button:last-child]:text-white [&>button:last-child]:opacity-100 [&>button:last-child]:hover:bg-black/75"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            step(-1)
          }

          if (event.key === 'ArrowRight') {
            step(1)
          }
        }}
      >
        <DialogTitle className="sr-only">Foto da conversa</DialogTitle>

        <div className="relative flex items-center justify-center">
          <img
            src={current.url ?? ''}
            alt="Anexo da conversa"
            className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
          />

          {images.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Foto anterior"
                className="absolute left-2 rounded-full bg-black/55 text-white hover:bg-black/75 hover:text-white"
                onClick={() => step(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Próxima foto"
                className="absolute right-2 rounded-full bg-black/55 text-white hover:bg-black/75 hover:text-white"
                onClick={() => step(1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>

              <span className="absolute bottom-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                {currentIndex + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
