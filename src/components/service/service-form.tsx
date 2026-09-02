import { useState } from 'react'
import { toast } from 'sonner'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { CityCombobox } from '@/components/location/city-combobox'
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
import { PRICE_TYPE_LABEL, SERVICE_MODE_LABEL } from '@/lib/format'
import type { City } from '@/lib/locations'
import type {
  PriceType,
  Service,
  ServiceInput,
  ServiceMode,
} from '@/lib/services'

export type ServiceFormValues = ServiceInput & { publish: boolean }

type FieldErrors = Partial<Record<keyof ServiceInput | 'general', string>>

const PRICE_TYPES = Object.keys(PRICE_TYPE_LABEL) as PriceType[]
const SERVICE_MODES = Object.keys(SERVICE_MODE_LABEL) as ServiceMode[]

const MIN_TITLE = 6
const MIN_DESCRIPTION = 30

function centsToInput(cents: number | null) {
  return cents === null ? '' : String(cents / 100).replace('.', ',')
}

function inputToCents(value: string) {
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'))

  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null
}

function validate(values: ServiceFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.title.trim().length < MIN_TITLE) {
    errors.title = `O título precisa ter ao menos ${MIN_TITLE} caracteres.`
  }

  if (values.description.trim().length < MIN_DESCRIPTION) {
    errors.description = `Descreva o serviço com ao menos ${MIN_DESCRIPTION} caracteres.`
  }

  if (!values.categoryId) {
    errors.categoryId = 'Escolha uma categoria.'
  }

  if (!values.cityId) {
    errors.cityId = 'Escolha a cidade onde você atende.'
  }

  if (values.priceType !== 'quote' && values.priceCents === null) {
    errors.priceCents = 'Informe o valor ou escolha "orçamento a combinar".'
  }

  return errors
}

export function ServiceForm({
  categories,
  service,
  initialCity,
  submitLabel,
  onSubmit,
}: {
  categories: ServiceCategory[]
  service?: Service
  initialCity?: City | null
  submitLabel: string
  onSubmit: (values: ServiceFormValues) => Promise<void>
}) {
  const [city, setCity] = useState<City | null>(initialCity ?? null)
  const [title, setTitle] = useState(service?.title ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? 0)
  const [priceType, setPriceType] = useState<PriceType>(
    service?.priceType ?? 'fixed',
  )
  const [price, setPrice] = useState(centsToInput(service?.priceCents ?? null))
  const [serviceMode, setServiceMode] = useState<ServiceMode>(
    service?.serviceMode ?? 'at_client',
  )
  const [coverage, setCoverage] = useState(
    service?.coverageRadiusKm ? String(service.coverageRadiusKm) : '',
  )
  const [neighborhood, setNeighborhood] = useState(service?.neighborhood ?? '')
  const [publish, setPublish] = useState(service ? service.status === 'published' : true)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const requiresPrice = priceType !== 'quote'

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    const values: ServiceFormValues = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      cityId: city?.id ?? 0,
      priceType,
      priceCents: requiresPrice ? inputToCents(price) : null,
      serviceMode,
      coverageRadiusKm: coverage ? Number(coverage) : null,
      neighborhood: neighborhood.trim() || null,
      publish,
    }

    const found = validate(values)
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
        toast.error('Não foi possível salvar o serviço.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="service-title">Título do serviço</Label>
        <Input
          id="service-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Instalação de chuveiro elétrico"
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
        <Label htmlFor="service-description">Descrição</Label>
        <Textarea
          id="service-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Explique o que está incluído, como você trabalha, o que o cliente precisa providenciar e o prazo médio."
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
          <Label htmlFor="service-city">Cidade base</Label>
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
          <Label htmlFor="service-price-type">Como você cobra</Label>
          <Select
            value={priceType}
            onValueChange={(next) => setPriceType(next as PriceType)}
          >
            <SelectTrigger id="service-price-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {PRICE_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="service-price">
            Valor {requiresPrice ? '(R$)' : '(definido no orçamento)'}
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
          <Label htmlFor="service-mode">Forma de atendimento</Label>
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
                  {SERVICE_MODE_LABEL[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="service-coverage">
            Raio de atendimento em km (opcional)
          </Label>
          <Input
            id="service-coverage"
            value={coverage}
            onChange={(event) => setCoverage(event.target.value)}
            inputMode="numeric"
            placeholder="40"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border p-4">
        <div>
          <p className="font-semibold">Publicar agora</p>
          <p className="text-sm text-muted-foreground">
            Desligue para salvar como rascunho e publicar depois.
          </p>
        </div>
        <Switch checked={publish} onCheckedChange={setPublish} />
      </div>

      <div className="flex flex-wrap gap-3">
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
