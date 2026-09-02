import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { apiErrorMessage } from '@/lib/form-errors'
import { type ServicePhoto, servicesApi } from '@/lib/services'
import { useAuth } from '@/providers/auth-context'

const MAX_PHOTOS = 10
const MAX_SIZE_IN_MB = 8
const ACCEPT = '.jpg,.jpeg,.png,.webp'

export function ServicePhotoManager({
  serviceId,
  photos: initial,
}: {
  serviceId: number
  photos: ServicePhoto[]
}) {
  const { token } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState(initial)
  const [isUploading, setIsUploading] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!token || files.length === 0) {
      return
    }

    const room = MAX_PHOTOS - photos.length

    if (room <= 0) {
      toast.error(`Cada serviço aceita no máximo ${MAX_PHOTOS} fotos.`)
      return
    }

    setIsUploading(true)

    for (const file of files.slice(0, room)) {
      if (file.size > MAX_SIZE_IN_MB * 1024 * 1024) {
        toast.error(`${file.name} passa de ${MAX_SIZE_IN_MB} MB.`)
        continue
      }

      try {
        const photo = await servicesApi.addPhoto(token, serviceId, file)
        setPhotos((current) => [...current, photo])
      } catch (error) {
        toast.error(apiErrorMessage(error))
      }
    }

    setIsUploading(false)
  }

  async function remove(photoId: number) {
    if (!token) {
      return
    }

    setRemovingId(photoId)

    try {
      await servicesApi.removePhoto(token, serviceId, photoId)
      setPhotos((current) => current.filter((photo) => photo.id !== photoId))
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setRemovingId(null)
    }
  }

  async function move(photoId: number, direction: -1 | 1) {
    if (!token) {
      return
    }

    const index = photos.findIndex((photo) => photo.id === photoId)
    const target = index + direction

    if (index < 0 || target < 0 || target >= photos.length) {
      return
    }

    const reordered = [...photos]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    setPhotos(reordered)

    try {
      await servicesApi.reorderPhotos(
        token,
        serviceId,
        reordered.map((photo) => photo.id),
      )
    } catch (error) {
      setPhotos(photos)
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Fotos do serviço</p>
          <p className="text-sm text-muted-foreground">
            {photos.length}/{MAX_PHOTOS} · a primeira foto é a capa do anúncio.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={onFiles}
        />

        <Button
          type="button"
          variant="outline"
          disabled={isUploading || photos.length >= MAX_PHOTOS}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {isUploading ? 'Enviando...' : 'Adicionar fotos'}
        </Button>
      </div>

      {photos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Anúncios com fotos recebem muito mais contatos. Envie ao menos uma.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="group relative overflow-hidden rounded-xl bg-surface-muted"
            >
              <img
                src={photo.url ?? ''}
                alt=""
                className="aspect-square w-full object-cover"
              />

              {index === 0 ? (
                <span className="absolute top-2 left-2 rounded-full bg-background px-2 py-0.5 text-[11px] font-bold">
                  Capa
                </span>
              ) : null}

              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(photo.id, -1)}
                    disabled={index === 0}
                    aria-label="Mover para a esquerda"
                    className="grid size-7 place-items-center rounded-full bg-background/90 text-xs disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => move(photo.id, 1)}
                    disabled={index === photos.length - 1}
                    aria-label="Mover para a direita"
                    className="grid size-7 place-items-center rounded-full bg-background/90 text-xs disabled:opacity-40"
                  >
                    ›
                  </button>
                </span>

                <button
                  type="button"
                  onClick={() => remove(photo.id)}
                  disabled={removingId === photo.id}
                  aria-label="Remover foto"
                  className="grid size-7 place-items-center rounded-full bg-background/90 text-danger"
                >
                  {removingId === photo.id ? (
                    <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
