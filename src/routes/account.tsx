import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Briefcase, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AvatarUploader } from '@/components/account/avatar-uploader'
import { CityCombobox } from '@/components/location/city-combobox'
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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/text-area'
import { applyApiErrors } from '@/lib/form-errors'
import type { City } from '@/lib/locations'
import { type ProfileValues, profileSchema } from '@/lib/validation'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/account')({
  component: Conta,
  head: () => ({ meta: [{ title: 'Meu perfil | DodoPlace' }] }),
})

const FIELDS = [
  'name',
  'headline',
  'bio',
  'whatsapp',
  'instagram',
  'website',
] as const

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
  const [city, setCity] = useState<City | null>(null)
  const [isCityDirty, setIsCityDirty] = useState(false)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      headline: '',
      bio: '',
      whatsapp: '',
      instagram: '',
      website: '',
    },
  })
  const { reset } = form

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({ to: '/signin', search: { redirect: '/account' }, replace: true })
    }
  }, [status, navigate])

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        headline: user.headline ?? '',
        bio: user.bio ?? '',
        whatsapp: user.whatsapp ?? '',
        instagram: user.instagram ? `@${user.instagram}` : '',
        website: user.website ?? '',
      })
      setCity(user.city ?? null)
      setIsCityDirty(false)
    }
  }, [user, reset])

  if (status !== 'authenticated' || !user) {
    return <ProfileSkeleton />
  }

  async function onSubmit(values: ProfileValues) {
    setFormError(null)

    try {
      await updateProfile({
        name: values.name.trim() || null,
        headline: values.headline.trim() || null,
        bio: values.bio.trim() || null,
        whatsapp: values.whatsapp.trim() || null,
        instagram: values.instagram.trim() || null,
        website: values.website.trim() || null,
        cityId: city?.id ?? null,
      })
      setIsCityDirty(false)
      toast.success('Perfil atualizado.')
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, FIELDS))
    }
  }

  async function onSignOut() {
    await signOut()
    navigate({ to: '/', replace: true })
  }

  const canSave = form.formState.isDirty || isCityDirty

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Meu perfil
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Estes dados aparecem no seu perfil público e nos seus anúncios.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="justify-start">
          <Link to="/account/services">
            <Briefcase aria-hidden="true" />
            Meus serviços
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/favorites">
            <Heart aria-hidden="true" />
            Favoritos
          </Link>
        </Button>
      </div>

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

          <p className="text-sm text-muted-foreground">
            Membro desde {formatDate(user.createdAt)} ·{' '}
            <Link
              to="/profile/$userId"
              params={{ userId: String(user.id) }}
              className="font-semibold underline"
            >
              ver meu perfil público
            </Link>
          </p>

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

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chamada profissional</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex.: Eletricista predial · 12 anos de experiência"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Uma linha curta que resume o que você faz.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobre você</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Conte sua experiência, seus diferenciais e a região onde atende."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-1.5">
                <Label htmlFor="profile-city">Cidade</Label>
                <CityCombobox
                  id="profile-city"
                  value={city}
                  onChange={(next) => {
                    setCity(next)
                    setIsCityDirty(true)
                  }}
                />
              </div>

              <Separator />

              <p className="text-sm font-bold">Contatos</p>

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        placeholder="(49) 99123-4567"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      É por aqui que os clientes vão falar com você.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@seuperfil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="url"
                        placeholder="https://seusite.com.br"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !canSave}
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
