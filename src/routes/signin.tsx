import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { LogoMark } from '@/components/brand/logo'
import { MagicLinkSent } from '@/components/auth/magic-link-sent'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import type { MagicLinkResult } from '@/lib/auth'
import { applyApiErrors } from '@/lib/form-errors'
import { type SignInValues, signInSchema } from '@/lib/validation'
import { useAuth } from '@/providers/auth-context'

type LoginSearch = { redirect?: string }

export const Route = createFileRoute('/signin')({
  component: Entrar,
  head: () => ({ meta: [{ title: 'Entrar | DodoPlace' }] }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const redirect = search.redirect
    return typeof redirect === 'string' && redirect.startsWith('/')
      ? { redirect }
      : {}
  },
})

function Entrar() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const { requestMagicLink, status } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState<{
    email: string
    result: MagicLinkResult
  } | null>(null)

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    if (status === 'authenticated') {
      navigate({ to: redirect ?? '/account', replace: true })
    }
  }, [status, redirect, navigate])

  async function onSubmit(values: SignInValues) {
    setFormError(null)

    try {
      const result = await requestMagicLink({ email: values.email })
      setSent({ email: values.email, result })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['email']))
    }
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 md:px-6 md:py-16">
      <LogoMark className="mb-5 h-14" alt="DodoPlace" />
      <Heading variant="h1" className="text-3xl font-extrabold">
        Entrar
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Sem senha: enviamos um link de acesso para o seu e-mail.
      </p>

      <Card className="mt-6">
        {sent ? (
          <CardContent className="pt-6">
            <MagicLinkSent
              email={sent.email}
              result={sent.result}
              onReset={() => setSent(null)}
            />
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
              <CardDescription>
                Informe o e-mail da sua conta.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                  noValidate
                >
                  {formError ? (
                    <Alert variant="danger">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="voce@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Você recebe um link e entra com um clique.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    className="mt-2"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? 'Enviando...'
                      : 'Enviar link de acesso'}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Ainda não tem conta?{' '}
                <Link to="/signup" className="font-bold underline">
                  Criar conta
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </section>
  )
}
