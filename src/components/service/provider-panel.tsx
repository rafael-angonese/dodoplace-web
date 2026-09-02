import { Link } from '@tanstack/react-router'
import { Globe, MessageCircle } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { instagramLink, whatsappLink } from '@/lib/format'
import type { PublicProfile } from '@/lib/services'

export function ProviderPanel({
  provider,
  serviceTitle,
  showProfileLink = true,
}: {
  provider: PublicProfile
  serviceTitle?: string
  showProfileLink?: boolean
}) {
  const whatsapp = whatsappLink(
    provider.whatsapp,
    serviceTitle
      ? `Olá! Vi seu serviço "${serviceTitle}" no FazPerto e gostaria de um orçamento.`
      : 'Olá! Vi seu perfil no FazPerto e gostaria de um orçamento.',
  )
  const instagram = instagramLink(provider.instagram)

  return (
    <section className="rounded-2xl border border-border p-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {provider.avatarUrl ? (
            <AvatarImage
              src={provider.avatarUrl}
              alt={provider.name ?? ''}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-brand-yellow text-lg font-extrabold text-[#202124]">
            {provider.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <Heading variant="h4" className="truncate">
            {provider.name ?? 'Profissional'}
          </Heading>
          {provider.headline ? (
            <p className="text-sm text-muted-foreground">{provider.headline}</p>
          ) : null}
          {provider.city ? (
            <p className="text-sm text-muted-foreground">
              {provider.city.label}
            </p>
          ) : null}
        </div>
      </div>

      {provider.bio ? (
        <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {provider.bio}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {whatsapp ? (
          <Button asChild>
            <a href={whatsapp} target="_blank" rel="noreferrer noopener">
              <MessageCircle aria-hidden="true" />
              Chamar no WhatsApp
            </a>
          </Button>
        ) : null}

        {instagram ? (
          <Button asChild variant="outline">
            <a href={instagram} target="_blank" rel="noreferrer noopener">
              @{provider.instagram}
            </a>
          </Button>
        ) : null}

        {provider.website ? (
          <Button asChild variant="outline">
            <a
              href={provider.website}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Globe aria-hidden="true" />
              Site
            </a>
          </Button>
        ) : null}

        {showProfileLink ? (
          <Button asChild variant="ghost">
            <Link to="/perfil/$userId" params={{ userId: String(provider.id) }}>
              Ver perfil completo
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
}
