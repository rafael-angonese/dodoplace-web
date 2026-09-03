import { Play, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { Dropzone } from '@/components/ui/dropzone'
import { formatFileSize } from '@/lib/format'
import {
  SERVICE_IMAGE_EXTENSIONS,
  SERVICE_MEDIA_MAX_COUNT,
  SERVICE_PHOTO_MAX_BYTES,
  SERVICE_VIDEO_EXTENSIONS,
  SERVICE_VIDEO_MAX_BYTES,
  type ServiceMediaKind,
} from '@/lib/services'

const ACCEPT = {
  'image/*': SERVICE_IMAGE_EXTENSIONS,
  'video/*': SERVICE_VIDEO_EXTENSIONS,
}

export type PendingServiceMedia = {
  id: string
  file: File
  previewUrl: string
  kind: ServiceMediaKind
}

function mediaKind(file: File): ServiceMediaKind {
  if (file.type) {
    return file.type.startsWith('video/') ? 'video' : 'image'
  }

  return SERVICE_VIDEO_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  )
    ? 'video'
    : 'image'
}

function rejectionReason(file: File, kind: ServiceMediaKind) {
  const limit =
    kind === 'video' ? SERVICE_VIDEO_MAX_BYTES : SERVICE_PHOTO_MAX_BYTES

  if (file.size > limit) {
    return `${file.name} passa do limite de ${kind === 'video' ? '60' : '8'} MB.`
  }

  return null
}

export function ServiceMediaInput({
  media,
  onChange,
  disabled,
}: {
  media: PendingServiceMedia[]
  onChange: (media: PendingServiceMedia[]) => void
  disabled?: boolean
}) {
  const nextId = useRef(0)
  const mediaRef = useRef<PendingServiceMedia[]>([])

  mediaRef.current = media

  useEffect(() => {
    return () => {
      for (const item of mediaRef.current) {
        URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [])

  function addFiles(files: File[]) {
    const accepted: PendingServiceMedia[] = []
    let slots = SERVICE_MEDIA_MAX_COUNT - media.length

    for (const file of files) {
      const kind = mediaKind(file)
      const reason = rejectionReason(file, kind)

      if (reason) {
        toast.error(reason)
        continue
      }

      if (slots <= 0) {
        toast.error(
          `Você pode enviar até ${SERVICE_MEDIA_MAX_COUNT} arquivos por serviço.`,
        )
        break
      }

      nextId.current += 1
      slots -= 1
      accepted.push({
        id: `media-${nextId.current}`,
        file,
        previewUrl: URL.createObjectURL(file),
        kind,
      })
    }

    if (accepted.length > 0) {
      onChange([...media, ...accepted])
    }
  }

  function remove(id: string) {
    const target = media.find((item) => item.id === id)

    if (target) {
      URL.revokeObjectURL(target.previewUrl)
    }

    onChange(media.filter((item) => item.id !== id))
  }

  function move(id: string, direction: -1 | 1) {
    const index = media.findIndex((item) => item.id === id)
    const target = index + direction

    if (index < 0 || target < 0 || target >= media.length) {
      return
    }

    const reordered = [...media]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    onChange(reordered)
  }

  return (
    <div className="grid gap-3">
      <Dropzone
        accept={ACCEPT}
        multiple
        disabled={disabled || media.length >= SERVICE_MEDIA_MAX_COUNT}
        onDrop={addFiles}
        onDropRejected={() =>
          toast.error('Envie apenas fotos (JPG, PNG, WEBP) ou vídeos (MP4, WEBM, MOV).')
        }
        placeholder="Clique ou arraste fotos e vídeos aqui"
        dropZoneClassName="rounded-2xl"
      />

      <p className="text-xs text-muted-foreground">
        {media.length}/{SERVICE_MEDIA_MAX_COUNT} arquivos · a primeira foto é a
        capa do anúncio · fotos até 8 MB (JPG, PNG, WEBP) e vídeos até 60 MB
        (MP4, WEBM, MOV).
      </p>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item, index) => (
            <li
              key={item.id}
              className="group relative overflow-hidden rounded-xl bg-surface-muted"
            >
              {item.kind === 'video' ? (
                <>
                  <video
                    src={item.previewUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="aspect-square w-full object-cover"
                  >
                    <track kind="captions" />
                  </video>
                  <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 text-white">
                    <Play aria-hidden="true" className="size-6" />
                  </span>
                </>
              ) : (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="aspect-square w-full object-cover"
                />
              )}

              {index === 0 ? (
                <span className="absolute top-2 left-2 rounded-full bg-background px-2 py-0.5 text-[11px] font-bold">
                  Capa
                </span>
              ) : null}

              <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                {formatFileSize(item.file.size)}
              </span>

              <div className="absolute inset-x-1 top-1 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(item.id, -1)}
                    disabled={index === 0}
                    aria-label="Mover para a esquerda"
                    className="grid size-7 place-items-center rounded-full bg-background/90 text-xs disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item.id, 1)}
                    disabled={index === media.length - 1}
                    aria-label="Mover para a direita"
                    className="grid size-7 place-items-center rounded-full bg-background/90 text-xs disabled:opacity-40"
                  >
                    ›
                  </button>
                </span>

                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remover ${item.file.name}`}
                  className="grid size-7 place-items-center rounded-full bg-background/90 text-danger"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
