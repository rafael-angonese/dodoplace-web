import { AlertTriangle, Clock } from 'lucide-react'

import type { Service } from '@/lib/services'

export function ServiceModerationNotice({ service }: { service: Service }) {
  if (service.status === 'pending') {
    return (
      <div className="flex gap-3 rounded-2xl border border-warning/40 bg-warning/15 p-4">
        <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Em análise</p>
          <p className="text-sm text-muted-foreground">
            Estamos revisando o texto e as fotos deste anúncio. Enquanto isso
            ele fica visível só para você e não aparece nas buscas. Costuma
            levar poucos minutos.
          </p>
        </div>
      </div>
    )
  }

  if (service.status === 'rejected') {
    return (
      <div className="flex gap-3 rounded-2xl border border-danger/40 bg-danger/15 p-4">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Anúncio recusado</p>
          <p className="text-sm text-muted-foreground">
            {service.rejectionReason ??
              'O anúncio não passou na revisão de conteúdo.'}{' '}
            Ajuste o texto ou as fotos e publique de novo para uma nova análise.
          </p>
        </div>
      </div>
    )
  }

  return null
}
