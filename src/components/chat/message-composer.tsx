import { Paperclip, SendHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  ComposerAttachments,
  type PendingAttachment,
} from '@/components/chat/composer-attachments'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/text-area'
import {
  MESSAGE_ATTACHMENTS_MAX_COUNT,
  MESSAGE_IMAGE_MAX_BYTES,
  MESSAGE_VIDEO_MAX_BYTES,
  type ChatMessage,
  type SendMessageInput,
} from '@/lib/chat'

const TYPING_IDLE_MS = 2_500

const ACCEPTED_FILES = 'image/*,video/*'

function rejectionReason(file: File) {
  const isVideo = file.type.startsWith('video/')
  const limit = isVideo ? MESSAGE_VIDEO_MAX_BYTES : MESSAGE_IMAGE_MAX_BYTES

  if (file.size > limit) {
    return `${file.name} passa do limite de ${isVideo ? '20' : '10'} MB.`
  }

  return null
}

export function MessageComposer({
  replyTo,
  isSending,
  onCancelReply,
  onSend,
  onTyping,
}: {
  replyTo: ChatMessage | null
  isSending: boolean
  onCancelReply: () => void
  onSend: (input: SendMessageInput) => Promise<void>
  onTyping: (isTyping: boolean) => void
}) {
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attachmentsRef = useRef<PendingAttachment[]>([])
  const nextId = useRef(0)

  attachmentsRef.current = attachments

  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus()
    }
  }, [replyTo])

  useEffect(() => {
    return () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current)
      }

      for (const attachment of attachmentsRef.current) {
        URL.revokeObjectURL(attachment.previewUrl)
      }
    }
  }, [])

  function addFiles(files: File[]) {
    if (files.length === 0) {
      return
    }

    const accepted: PendingAttachment[] = []
    let slots = MESSAGE_ATTACHMENTS_MAX_COUNT - attachments.length

    for (const file of files) {
      const reason = rejectionReason(file)

      if (reason) {
        toast.error(reason)
        continue
      }

      if (slots <= 0) {
        toast.error(
          `Você pode enviar até ${MESSAGE_ATTACHMENTS_MAX_COUNT} arquivos por mensagem.`,
        )
        break
      }

      nextId.current += 1
      slots -= 1
      accepted.push({
        id: `attachment-${nextId.current}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    if (accepted.length > 0) {
      setAttachments((current) => [...current, ...accepted])
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const target = current.find((attachment) => attachment.id === id)

      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return current.filter((attachment) => attachment.id !== id)
    })
  }

  function clearAttachments() {
    for (const attachment of attachmentsRef.current) {
      URL.revokeObjectURL(attachment.previewUrl)
    }

    setAttachments([])
  }

  function signalTyping() {
    onTyping(true)

    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
    }

    idleTimer.current = setTimeout(() => onTyping(false), TYPING_IDLE_MS)
  }

  function stopTyping() {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }

    onTyping(false)
  }

  async function submit() {
    const text = body.trim()

    if ((!text && attachments.length === 0) || isSending) {
      return
    }

    stopTyping()

    await onSend({
      body: text || null,
      replyToId: replyTo?.id ?? null,
      attachments: attachments.map((attachment) => attachment.file),
    })

    setBody('')
    clearAttachments()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="border-t border-border bg-background px-3 py-3">
      {replyTo ? (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Respondendo {replyTo.author?.name ?? 'mensagem'}
            </p>
            <p className="line-clamp-2 text-muted-foreground">
              {replyTo.body ??
                (replyTo.attachments?.[0]?.type === 'video' ? 'Vídeo' : 'Foto')}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Cancelar resposta"
            onClick={onCancelReply}
          >
            <X aria-hidden="true" className="size-3.5" />
          </Button>
        </div>
      ) : null}

      <ComposerAttachments
        attachments={attachments}
        onRemove={removeAttachment}
      />

      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILES}
          className="hidden"
          onChange={(event) => {
            addFiles([...(event.target.files ?? [])])
            event.target.value = ''
          }}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Anexar fotos ou vídeos"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip aria-hidden="true" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={body}
          rows={1}
          placeholder="Escreva uma mensagem"
          className="max-h-32 min-h-11 resize-none rounded-2xl"
          onChange={(event) => {
            setBody(event.target.value)
            signalTyping()
          }}
          onBlur={stopTyping}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submit()
            }
          }}
          onPaste={(event) => {
            const files = [...event.clipboardData.files]

            if (files.length > 0) {
              event.preventDefault()
              addFiles(files)
            }
          }}
        />

        <Button
          type="submit"
          size="icon"
          className="rounded-full"
          aria-label="Enviar mensagem"
          disabled={isSending || (!body.trim() && attachments.length === 0)}
        >
          <SendHorizontal aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
