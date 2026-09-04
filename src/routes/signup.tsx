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
import { type SignUpValues, signUpSchema } from '@/lib/validation'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/signup')({
  component: Cadastro,
  head: () => ({ meta: [{ title: 'Criar conta | DodoPlace' }] }),
})

function Cadastro() {
  const navigate = useNavigate()
  const { requestMagicLink, status } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState<{
    email: string
    result: MagicLinkResult
  } | null>(null)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '' },
  })

  useEffect(() => {
    if (status === 'authenticated') {
      navigate({ to: '/account', replace: true })
    }
  }, [status, navigate])

  async function onSubmit(values: SignUpValues) {
    setFormError(null)

    try {
      const result = await requestMagicLink(values)
      setSent({ email: values.email, result })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['name', 'email']))
    }
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 md:px-6 md:py-16">
      <LogoMark className="mb-5 h-14" alt="DodoPlace" />
      <Heading variant="h1" className="text-3xl font-extrabold">
        Criar conta
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Sem senha para criar nem para lembrar: confirmamos seu e-mail por um
        link.
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
              <CardTitle className="text-xl">Seus dados</CardTitle>
              <CardDescription>
                Sua conta é criada quando você abre o link.
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Nome</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="name"
                            placeholder="Como devemos te chamar"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          Enviamos um link para confirmar que é você.
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
                      : 'Criar conta'}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <Link to="/signin" className="font-bold underline">
                  Entrar
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </section>
  )
}
