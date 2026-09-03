import { Loader2, RotateCw, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { Dropzone } from '@/components/ui/dropzone'
import { apiErrorMessage } from '@/lib/form-errors'
import { formatFileSize } from '@/lib/format'
import {
  SERVICE_IMAGE_EXTENSIONS,
  SERVICE_MEDIA_MAX_COUNT,
  SERVICE_PHOTO_MAX_BYTES,
  type ServiceMediaKind,
  serviceImageContentType,
  uploadServicePhotoFile,
} from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

const ACCEPT = {
  'image/*': SERVICE_IMAGE_EXTENSIONS,
  // Upload de vídeo desabilitado temporariamente:
  // 'video/*': SERVICE_VIDEO_EXTENSIONS,
}

export type PendingServiceMedia = {
  id: string
  file: File
  previewUrl: string
  kind: ServiceMediaKind
  status: 'uploading' | 'ready' | 'error'
  key: string | null
}

// Enquanto o vídeo está desabilitado todo arquivo aceito é imagem:
// function mediaKind(file: File): ServiceMediaKind {
//   if (file.type) {
//     return file.type.startsWith('video/') ? 'video' : 'image'
//   }
//
//   return SERVICE_VIDEO_EXTENSIONS.some((extension) =>
//     file.name.toLowerCase().endsWith(extension),
//   )
//     ? 'video'
//     : 'image'
// }
const MEDIA_KIND: ServiceMediaKind = 'image'

function rejectionReason(file: File) {
  if (!serviceImageContentType(file)) {
    return `${file.name} não é uma imagem JPG, PNG ou WEBP.`
  }

  // Upload de vídeo desabilitado temporariamente:
  // const limit =
  //   kind === 'video' ? SERVICE_VIDEO_MAX_BYTES : SERVICE_PHOTO_MAX_BYTES
  if (file.size > SERVICE_PHOTO_MAX_BYTES) {
    return `${file.name} passa do limite de 8 MB.`
  }

  return null
}

export function ServiceMediaInput({
  media,
  onChange,
  disabled,
}: {
  media: PendingServiceMedia[]
  onChange: React.Dispatch<React.SetStateAction<PendingServiceMedia[]>>
  disabled?: boolean
}) {
  const { token } = useAuth()
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

  function patch(id: string, changes: Partial<PendingServiceMedia>) {
    onChange((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    )
  }

  async function upload(id: string, file: File) {
    if (!token) {
      return
    }

    try {
      const key = await uploadServicePhotoFile(token, file)
      patch(id, { status: 'ready', key })
    } catch (error) {
      patch(id, { status: 'error', key: null })
      toast.error(apiErrorMessage(error))
    }
  }

  function addFiles(files: File[]) {
    const accepted: PendingServiceMedia[] = []
    let slots = SERVICE_MEDIA_MAX_COUNT - media.length

    for (const file of files) {
      const reason = rejectionReason(file)

      if (reason) {
        toast.error(reason)
        continue
      }

      if (slots <= 0) {
        toast.error(
          `Você pode enviar até ${SERVICE_MEDIA_MAX_COUNT} fotos por serviço.`,
        )
        break
      }

      nextId.current += 1
      slots -= 1
      accepted.push({
        id: `media-${nextId.current}`,
        file,
        previewUrl: URL.createObjectURL(file),
        kind: MEDIA_KIND,
        status: 'uploading',
        key: null,
      })
    }

    if (accepted.length === 0) {
      return
    }

    onChange((current) => [...current, ...accepted])

    for (const item of accepted) {
      void upload(item.id, item.file)
    }
  }

  function retry(item: PendingServiceMedia) {
    patch(item.id, { status: 'uploading' })
    void upload(item.id, item.file)
  }

  function remove(id: string) {
    const target = media.find((item) => item.id === id)

    if (target) {
      URL.revokeObjectURL(target.previewUrl)
    }

    onChange((current) => current.filter((item) => item.id !== id))
  }

  function move(id: string, direction: -1 | 1) {
    onChange((current) => {
      const index = current.findIndex((item) => item.id === id)
      const target = index + direction

      if (index < 0 || target < 0 || target >= current.length) {
        return current
      }

      const reordered = [...current]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(target, 0, moved)

      return reordered
    })
  }

  const uploading = media.filter((item) => item.status === 'uploading').length

  return (
    <div className="grid gap-3">
      <Dropzone
        accept={ACCEPT}
        multiple
        disabled={disabled || media.length >= SERVICE_MEDIA_MAX_COUNT}
        onDrop={addFiles}
        onDropRejected={() =>
          toast.error('Envie apenas fotos (JPG, PNG, WEBP).')
        }
        placeholder="Clique ou arraste fotos aqui"
        dropZoneClassName="rounded-2xl"
      />

      <p className="text-xs text-muted-foreground">
        {media.length}/{SERVICE_MEDIA_MAX_COUNT} fotos · a primeira foto é a
        capa do anúncio · até 8 MB por foto (JPG, PNG, WEBP).
        {uploading > 0 ? ` · enviando ${uploading}...` : null}
      </p>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item, index) => (
            <li
              key={item.id}
              className="group relative overflow-hidden rounded-xl bg-surface-muted"
            >
              {/* Preview de vídeo desabilitado temporariamente:
              {item.kind === 'video' ? (
                <video
                  src={item.previewUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-square w-full object-cover"
                >
                  <track kind="captions" />
                </video>
              ) : null} */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className={
                  item.status === 'ready'
                    ? 'aspect-square w-full object-cover'
                    : 'aspect-square w-full object-cover opacity-50'
                }
              />

              {item.status === 'uploading' ? (
                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 text-white">
                  <Loader2 aria-hidden="true" className="size-6 animate-spin" />
                  <span className="sr-only">Enviando {item.file.name}</span>
                </span>
              ) : null}

              {item.status === 'error' ? (
                <button
                  type="button"
                  onClick={() => retry(item)}
                  className="absolute inset-0 grid place-items-center gap-1 bg-danger/70 text-xs font-semibold text-white"
                >
                  <RotateCw aria-hidden="true" className="size-5" />
                  Tentar de novo
                </button>
              ) : null}

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
