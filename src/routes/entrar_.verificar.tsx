import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Icon } from '@/components/ui/icon'
import { apiErrorMessage } from '@/lib/form-errors'
import { useAuth } from '@/providers/auth-context'

type VerifySearch = { token?: string }

export const Route = createFileRoute('/entrar_/verificar')({
  component: Verificar,
  head: () => ({ meta: [{ title: 'Confirmando acesso | FazPerto' }] }),
  validateSearch: (search: Record<string, unknown>): VerifySearch => {
    return typeof search.token === 'string' && search.token
      ? { token: search.token }
      : {}
  },
})

type State = 'verifying' | 'error'

function Verificar() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const { verifyMagicLink } = useAuth()
  const [state, setState] = useState<State>('verifying')
  const [message, setMessage] = useState<string | null>(null)

  // O token é de uso único: em StrictMode o efeito roda duas vezes e a segunda
  // chamada consumiria um token já gasto, mostrando erro numa sessão válida.
  const consumed = useRef(false)

  useEffect(() => {
    if (consumed.current) {
      return
    }
    consumed.current = true

    if (!token) {
      setState('error')
      setMessage('O link está incompleto. Solicite um novo acesso.')
      return
    }

    verifyMagicLink(token)
      .then(() => navigate({ to: '/conta', replace: true }))
      .catch((error: unknown) => {
        setState('error')
        setMessage(apiErrorMessage(error))
      })
  }, [token, verifyMagicLink, navigate])

  return (
    <section className="mx-auto w-full max-w-md px-4 py-16 md:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {state === 'verifying' ? (
            <>
              <Icon
                name="loader2"
                size={32}
                className="animate-spin text-muted-foreground"
              />
              <Heading variant="h4">Confirmando seu acesso...</Heading>
              <p className="text-sm text-muted-foreground">
                Um instante, estamos validando o link.
              </p>
            </>
          ) : (
            <>
              <span className="grid size-14 place-items-center rounded-full bg-danger/15 text-danger">
                <Icon name="circle-alert" size={28} />
              </span>
              <Heading variant="h4">Não foi possível entrar</Heading>
              <p className="text-sm text-muted-foreground">{message}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/entrar">Pedir novo link</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Ir para o início</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
