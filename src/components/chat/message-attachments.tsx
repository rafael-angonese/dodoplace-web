import { ImageIcon, Play } from 'lucide-react'
import { useState } from 'react'

import { ImageLightbox } from '@/components/chat/image-lightbox'
import type { MessageAttachment } from '@/lib/chat'
import { formatFileSize } from '@/lib/format'
import { cn } from '@/utils/cn'

function compactLabel(attachments: MessageAttachment[]) {
  if (attachments.length === 1) {
    return attachments[0].type === 'video' ? 'Vídeo' : 'Foto'
  }

  if (attachments.every((attachment) => attachment.type === 'image')) {
    return `${attachments.length} fotos`
  }

  if (attachments.every((attachment) => attachment.type === 'video')) {
    return `${attachments.length} vídeos`
  }

  return `${attachments.length} arquivos`
}

export function MessageAttachments({
  attachments,
  compact = false,
}: {
  attachments: MessageAttachment[]
  compact?: boolean
}) {
  const [openedImage, setOpenedImage] = useState<number | null>(null)

  if (attachments.length === 0) {
    return null
  }

  if (compact) {
    const hasVideo = attachments.some((attachment) => attachment.type === 'video')

    return (
      <span className="inline-flex items-center gap-1">
        {hasVideo ? (
          <Play aria-hidden="true" className="size-3.5" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-3.5" />
        )}
        {compactLabel(attachments)}
      </span>
    )
  }

  const images = attachments.filter(
    (attachment) => attachment.type === 'image' && attachment.url,
  )
  const isGrid = attachments.length > 1

  return (
    <>
      <ul
        className={cn('gap-1', isGrid ? 'grid grid-cols-2' : 'flex flex-col gap-2')}
      >
        {attachments.map((attachment) => (
          <li key={attachment.id} className={cn(isGrid && 'min-w-0')}>
            {attachment.type === 'image' && attachment.url ? (
              <button
                type="button"
                className="block w-full cursor-zoom-in"
                aria-label="Ampliar foto"
                onClick={() =>
                  setOpenedImage(
                    images.findIndex((image) => image.id === attachment.id),
                  )
                }
              >
                <img
                  src={attachment.url}
                  alt="Anexo da mensagem"
                  loading="lazy"
                  className={cn(
                    'w-full rounded-xl object-cover',
                    isGrid ? 'aspect-square' : 'max-h-72',
                  )}
                />
              </button>
            ) : null}

            {attachment.type === 'video' && attachment.url ? (
              <video
                controls
                preload="metadata"
                src={attachment.url}
                className={cn(
                  'w-full rounded-xl bg-black object-cover',
                  isGrid ? 'aspect-square' : 'max-h-72',
                )}
              >
                <track kind="captions" />
              </video>
            ) : null}

            {attachment.sizeBytes && !isGrid ? (
              <span className="mt-1 block text-[11px] opacity-70">
                {formatFileSize(attachment.sizeBytes)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <ImageLightbox
        images={images}
        index={openedImage}
        onIndexChange={setOpenedImage}
        onClose={() => setOpenedImage(null)}
      />
    </>
  )
}
