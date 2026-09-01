import { MailCheck } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import type { MagicLinkResult } from '@/lib/auth'

export function MagicLinkSent({
  email,
  result,
  onReset,
}: {
  email: string
  result: MagicLinkResult
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-brand-yellow text-[#202124]">
        <MailCheck aria-hidden="true" className="size-7" />
      </span>

      <div>
        <Heading variant="h4">Confira seu e-mail</Heading>
        <p className="mt-2 text-sm text-muted-foreground">
          Se <span className="font-semibold text-foreground">{email}</span>{' '}
          puder receber acesso, enviamos um link para lá. Ele vale por{' '}
          {result.expiresInMinutes} minutos e só pode ser usado uma vez.
        </p>
      </div>

      {result.devUrl ? (
        <Alert className="text-left">
          <AlertTitle>Modo desenvolvimento</AlertTitle>
          <AlertDescription>
            <span>
              A API está sem <code>RESEND_API_KEY</code>, então nada foi
              enviado. Use o link abaixo:
            </span>
            <a
              href={result.devUrl}
              className="font-semibold break-all underline"
            >
              {result.devUrl}
            </a>
          </AlertDescription>
        </Alert>
      ) : null}

      <Button variant="outline" onClick={onReset}>
        Usar outro e-mail
      </Button>
    </div>
  )
}
