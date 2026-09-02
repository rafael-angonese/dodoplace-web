import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ApiError } from '@/lib/api'
import type { User } from '@/lib/auth'
import { useAuth } from '@/providers/auth-context'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp'
const MAX_SIZE_IN_MB = 5
const MAX_SIZE_IN_BYTES = MAX_SIZE_IN_MB * 1024 * 1024

function validate(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Envie uma imagem JPG, PNG ou WEBP.'
  }

  if (file.size > MAX_SIZE_IN_BYTES) {
    return `A imagem precisa ter no máximo ${MAX_SIZE_IN_MB} MB.`
  }

  return null
}

function describeError(error: unknown) {
  if (error instanceof ApiError) {
    return error.fieldErrors.avatar ?? error.generalMessage ?? error.message
  }

  return 'Não foi possível enviar a foto. Tente novamente.'
}

export function AvatarUploader({ user }: { user: User }) {
  const { updateAvatar, removeAvatar } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    if (!preview) {
      return
    }

    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const isBusy = isUploading || isRemoving

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const validationError = validate(file)

    if (validationError) {
      toast.error(validationError)
      return
    }

    setPreview(URL.createObjectURL(file))
    setIsUploading(true)

    try {
      await updateAvatar(file)
      toast.success('Foto de perfil atualizada.')
    } catch (error) {
      toast.error(describeError(error))
    } finally {
      setPreview(null)
      setIsUploading(false)
    }
  }

  async function onRemove() {
    setIsRemoving(true)

    try {
      await removeAvatar()
      toast.success('Foto de perfil removida.')
    } catch (error) {
      toast.error(describeError(error))
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-20">
          {preview || user.avatarUrl ? (
            <AvatarImage
              src={preview ?? user.avatarUrl ?? undefined}
              alt={`Foto de perfil de ${user.name ?? user.email}`}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-brand-yellow text-xl font-extrabold text-[#202124]">
            {user.initials}
          </AvatarFallback>
        </Avatar>

        {isUploading ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
            <Icon name="loader2" className="animate-spin" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          onChange={onFileChange}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="camera" size={16} />
            {user.avatarUrl ? 'Trocar foto' : 'Enviar foto'}
          </Button>

          {user.avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={onRemove}
            >
              <Icon name="trash2" size={16} />
              {isRemoving ? 'Removendo...' : 'Remover'}
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG ou WEBP, até {MAX_SIZE_IN_MB} MB.
        </p>
      </div>
    </div>
  )
}
