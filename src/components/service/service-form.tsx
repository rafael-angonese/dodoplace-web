import { useState } from 'react'
import { toast } from 'sonner'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { CityCombobox } from '@/components/location/city-combobox'
import {
  type PendingServiceMedia,
  ServiceMediaInput,
} from '@/components/service/service-media-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/text-area'
import { ApiError } from '@/lib/api'
import type { ServiceCategory } from '@/lib/categories'
import { PRICE_TYPE_LABEL, serviceModeLabel } from '@/lib/format'
import type { City } from '@/lib/locations'
import type {
  PriceType,
  Service,
  ServiceInput,
  ServiceMode,
  ServiceType,
} from '@/lib/services'

export type ServiceFormValues = ServiceInput & {
  publish: boolean
  media: File[]
}

type FieldErrors = Partial<
  Record<keyof ServiceInput | 'general' | 'media', string>
>

const PRICE_TYPES = Object.keys(PRICE_TYPE_LABEL) as PriceType[]
const SERVICE_MODES: ServiceMode[] = ['at_client', 'at_provider', 'remote']

const MIN_TITLE = 6
const MIN_DESCRIPTION = 30

type ServiceCopy = {
  mediaLabel: string
  mediaHint: string | null
  mediaRequired: boolean
  mediaError: string
  titleLabel: string
  titlePlaceholder: string
  titleError: string
  descriptionLabel: string
  descriptionPlaceholder: string
  descriptionError: string
  cityLabel: string
  cityError: string
  priceTypeLabel: string
  priceLabel: string
  priceQuoteLabel: string
  modeLabel: string
  coverageLabel: string
  publishTitle: string
  publishDescription: string
}

const COPY: Record<ServiceType, ServiceCopy> = {
  offer: {
    mediaLabel: 'Fotos e vídeos',
    mediaHint: null,
    mediaRequired: true,
    mediaError: 'Envie pelo menos uma foto do serviço.',
    titleLabel: 'Título do serviço',
    titlePlaceholder: 'Ex.: Instalação de chuveiro elétrico',
    titleError: `O título precisa ter ao menos ${MIN_TITLE} caracteres.`,
    descriptionLabel: 'Descrição',
    descriptionPlaceholder:
      'Explique o que está incluído, como você trabalha, o que o cliente precisa providenciar e o prazo médio.',
    descriptionError: `Descreva o serviço com ao menos ${MIN_DESCRIPTION} caracteres.`,
    cityLabel: 'Cidade base',
    cityError: 'Escolha a cidade onde você atende.',
    priceTypeLabel: 'Como você cobra',
    priceLabel: 'Valor (R$)',
    priceQuoteLabel: 'Valor (definido no orçamento)',
    modeLabel: 'Forma de atendimento',
    coverageLabel: 'Raio de atendimento em km (opcional)',
    publishTitle: 'Publicar agora',
    publishDescription: 'Desligue para salvar como rascunho e publicar depois.',
  },
  request: {
    mediaLabel: 'Fotos e vídeos (opcional)',
    mediaHint:
      'Fotos ajudam os profissionais a entender o que você precisa e a dar um orçamento mais preciso.',
    mediaRequired: false,
    mediaError: '',
    titleLabel: 'O que você precisa?',
    titlePlaceholder: 'Ex.: Preciso instalar um chuveiro elétrico',
    titleError: `O resumo precisa ter ao menos ${MIN_TITLE} caracteres.`,
    descriptionLabel: 'Detalhes do pedido',
    descriptionPlaceholder:
      'Explique o problema, o que você já tentou, o prazo desejado e o que já tem em casa (materiais, peças, ferramentas).',
    descriptionError: `Detalhe o pedido com ao menos ${MIN_DESCRIPTION} caracteres.`,
    cityLabel: 'Cidade do serviço',
    cityError: 'Escolha a cidade onde o serviço será feito.',
    priceTypeLabel: 'Como pretende pagar',
    priceLabel: 'Valor previsto (R$)',
    priceQuoteLabel: 'Valor (a combinar no orçamento)',
    modeLabel: 'Onde o serviço será feito',
    coverageLabel: 'Distância máxima que você aceita em km (opcional)',
    publishTitle: 'Publicar agora',
    publishDescription: 'Desligue para salvar como rascunho e publicar depois.',
  },
}

function centsToInput(cents: number | null) {
  return cents === null ? '' : String(cents / 100).replace('.', ',')
}

function inputToCents(value: string) {
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'))

  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null
}

function validate(
  values: ServiceFormValues,
  media: PendingServiceMedia[] | null,
  copy: ServiceCopy,
): FieldErrors {
  const errors: FieldErrors = {}

  if (
    media &&
    copy.mediaRequired &&
    !media.some((item) => item.kind === 'image')
  ) {
    errors.media = copy.mediaError
  }

  if (values.title.trim().length < MIN_TITLE) {
    errors.title = copy.titleError
  }

  if (values.description.trim().length < MIN_DESCRIPTION) {
    errors.description = copy.descriptionError
  }

  if (!values.categoryId) {
    errors.categoryId = 'Escolha uma categoria.'
  }

  if (!values.cityId) {
    errors.cityId = copy.cityError
  }

  if (values.priceType !== 'quote' && values.priceCents === null) {
    errors.priceCents = 'Informe o valor ou escolha "orçamento a combinar".'
  }

  return errors
}

function defaultPriceType(type: ServiceType) {
  return type === 'request' ? 'quote' : 'fixed'
}

export function ServiceForm({
  type,
  categories,
  service,
  initialCity,
  submitLabel,
  onSubmit,
  onBack,
}: {
  type: ServiceType
  categories: ServiceCategory[]
  service?: Service
  initialCity?: City | null
  submitLabel: string
  onSubmit: (values: ServiceFormValues) => Promise<void>
  onBack?: () => void
}) {
  const [city, setCity] = useState<City | null>(initialCity ?? null)
  const [title, setTitle] = useState(service?.title ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? 0)
  const [priceType, setPriceType] = useState<PriceType>(
    service?.priceType ?? defaultPriceType(type),
  )
  const [price, setPrice] = useState(centsToInput(service?.priceCents ?? null))
  const [serviceMode, setServiceMode] = useState<ServiceMode>(
    service?.serviceMode ?? 'at_client',
  )
  const [coverage, setCoverage] = useState(
    service?.coverageRadiusKm ? String(service.coverageRadiusKm) : '',
  )
  const [neighborhood, setNeighborhood] = useState(service?.neighborhood ?? '')
  const [publish, setPublish] = useState(
    service ? service.status === 'published' : true,
  )
  const [media, setMedia] = useState<PendingServiceMedia[]>([])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const copy = COPY[type]
  const isEditing = service !== undefined
  const requiresPrice = priceType !== 'quote'

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    const values: ServiceFormValues = {
      type,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      cityId: city?.id ?? 0,
      priceType,
      priceCents: requiresPrice ? inputToCents(price) : null,
      serviceMode,
      coverageRadiusKm: coverage ? Number(coverage) : null,
      neighborhood: neighborhood.trim() || null,
      publish: isEditing ? publish : true,
      media: media.map((item) => item.file),
    }

    const found = validate(values, isEditing ? null : media, copy)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      return
    }

    setIsSaving(true)

    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors as FieldErrors)
        toast.error(error.generalMessage ?? error.message)
      } else {
        toast.error('Não foi possível salvar o anúncio.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      {isEditing ? null : (
        <div className="grid gap-1.5">
          <Label>{copy.mediaLabel}</Label>
          <ServiceMediaInput
            media={media}
            onChange={setMedia}
            disabled={isSaving}
          />
          {copy.mediaHint ? (
            <p className="text-xs text-muted-foreground">{copy.mediaHint}</p>
          ) : null}
          <FieldError message={errors.media} />
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="service-title">{copy.titleLabel}</Label>
        <Input
          id="service-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={copy.titlePlaceholder}
          maxLength={120}
        />
        <FieldError message={errors.title} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="service-category">Categoria</Label>
        <Select
          value={categoryId ? String(categoryId) : ''}
          onValueChange={(next) => setCategoryId(Number(next))}
        >
          <SelectTrigger id="service-category">
            <SelectValue placeholder="Escolha a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                <span className="inline-flex items-center gap-2">
                  <CategoryIcon name={category.icon} className="size-4" />
                  {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.categoryId} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="service-description">{copy.descriptionLabel}</Label>
        <Textarea
          id="service-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={copy.descriptionPlaceholder}
          rows={7}
          maxLength={5000}
        />
        <p className="text-xs text-muted-foreground">
          {description.trim().length}/5000 caracteres
        </p>
        <FieldError message={errors.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="service-city">{copy.cityLabel}</Label>
          <CityCombobox id="service-city" value={city} onChange={setCity} />
          <FieldError message={errors.cityId} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="service-neighborhood">Bairro (opcional)</Label>
          <Input
            id="service-neighborhood"
            value={neighborhood}
            onChange={(event) => setNeighborhood(event.target.value)}
            placeholder="Ex.: Centro"
            maxLength={120}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="service-price-type">{copy.priceTypeLabel}</Label>
          <Select
            value={priceType}
            onValueChange={(next) => setPriceType(next as PriceType)}
          >
            <SelectTrigger id="service-price-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICE_TYPES.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {PRICE_TYPE_LABEL[entry]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="service-price">
            {requiresPrice ? copy.priceLabel : copy.priceQuoteLabel}
          </Label>
          <Input
            id="service-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="decimal"
            placeholder="150,00"
            disabled={!requiresPrice}
          />
          <FieldError message={errors.priceCents} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="service-mode">{copy.modeLabel}</Label>
          <Select
            value={serviceMode}
            onValueChange={(next) => setServiceMode(next as ServiceMode)}
          >
            <SelectTrigger id="service-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {serviceModeLabel(mode, type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="service-coverage">{copy.coverageLabel}</Label>
          <Input
            id="service-coverage"
            value={coverage}
            onChange={(event) => setCoverage(event.target.value)}
            inputMode="numeric"
            placeholder="40"
          />
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center justify-between rounded-2xl border border-border p-4">
          <div>
            <p className="font-semibold">{copy.publishTitle}</p>
            <p className="text-sm text-muted-foreground">
              {copy.publishDescription}
            </p>
          </div>
          <Switch checked={publish} onCheckedChange={setPublish} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={isSaving}
          >
            Voltar
          </Button>
        ) : null}
        <Button type="submit" size="lg" disabled={isSaving}>
          {isSaving ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm font-medium text-danger">{message}</p>
}
