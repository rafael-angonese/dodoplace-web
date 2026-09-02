import { Play, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/format'

export type PendingAttachment = {
  id: string
  file: File
  previewUrl: string
}

export function ComposerAttachments({
  attachments,
  onRemove,
}: {
  attachments: PendingAttachment[]
  onRemove: (id: string) => void
}) {
  if (attachments.length === 0) {
    return null
  }

  return (
    <ul className="mb-2 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="relative overflow-hidden rounded-xl border border-border bg-muted"
        >
          {attachment.file.type.startsWith('video/') ? (
            <>
              <video
                src={attachment.previewUrl}
                muted
                playsInline
                preload="metadata"
                className="size-24 object-cover"
              >
                <track kind="captions" />
              </video>
              <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 text-white">
                <Play aria-hidden="true" className="size-6" />
              </span>
            </>
          ) : (
            <img
              src={attachment.previewUrl}
              alt={attachment.file.name}
              className="size-24 object-cover"
            />
          )}

          <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
            {formatFileSize(attachment.file.size)}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 size-6 rounded-full bg-black/55 text-white hover:bg-black/75 hover:text-white"
            aria-label={`Remover ${attachment.file.name}`}
            onClick={() => onRemove(attachment.id)}
          >
            <X aria-hidden="true" className="size-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
