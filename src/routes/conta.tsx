import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AvatarUploader } from '@/components/account/avatar-uploader'
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
import { InfoItem, InfoLabel, InfoValue } from '@/components/ui/info'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { applyApiErrors } from '@/lib/form-errors'
import { type ProfileValues, profileSchema } from '@/lib/validation'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/conta')({
  component: Conta,
  head: () => ({ meta: [{ title: 'Meu perfil | FazPerto' }] }),
})

function formatDate(value: string | null) {
  if (!value) {
    return null
  }

  return format(new Date(value), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

function Conta() {
  const navigate = useNavigate()
  const { status, user, signOut, updateProfile } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  })
  const { reset } = form

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({ to: '/entrar', search: { redirect: '/conta' }, replace: true })
    }
  }, [status, navigate])

  useEffect(() => {
    if (user) {
      reset({ name: user.name ?? '' })
    }
  }, [user, reset])

  if (status !== 'authenticated' || !user) {
    return <ProfileSkeleton />
  }

  async function onSubmit(values: ProfileValues) {
    setFormError(null)

    try {
      await updateProfile({ name: values.name.trim() || null })
      toast.success('Perfil atualizado.')
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['name']))
    }
  }

  async function onSignOut() {
    await signOut()
    navigate({ to: '/', replace: true })
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Meu perfil
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Seus dados de conta no FazPerto.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">
            {user.name ?? 'Sem nome definido'}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <AvatarUploader user={user} />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem>
              <div>
                <InfoLabel>E-mail</InfoLabel>
                <InfoValue>{user.email}</InfoValue>
              </div>
            </InfoItem>
            <InfoItem>
              <div>
                <InfoLabel>Membro desde</InfoLabel>
                <InfoValue>{formatDate(user.createdAt)}</InfoValue>
              </div>
            </InfoItem>
          </div>

          <Separator />

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
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormDescription>
                      É assim que você aparece para outros usuários.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isDirty
                  }
                >
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={onSignOut}>
                  Sair da conta
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-72" />
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="mt-8 h-10 w-full" />
        <Skeleton className="mt-4 h-10 w-32" />
      </Card>
    </section>
  )
}
