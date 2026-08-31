import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heading } from '@/components/ui/heading'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { InputSearch } from '@/components/ui/input-search'
import { Label } from '@/components/ui/label'
import { LinearProgress } from '@/components/ui/linear-progress/linear-progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/text-area'
import { Tooltip } from '@/components/ui/tooltip'

export const Route = createFileRoute('/ui')({
  component: UiShowcase,
  head: () => ({ meta: [{ title: 'UI Kit — mkt-web' }] }),
})

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'success',
  'warning',
  'danger',
  'outline',
  'outline-primary',
  'outline-danger',
  'ghost',
  'link',
] as const

const BADGE_VARIANTS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'outline',
] as const

const PLANS = [
  { id: 'starter', name: 'Starter', seats: 3, status: 'Ativo' },
  { id: 'growth', name: 'Growth', seats: 12, status: 'Ativo' },
  { id: 'scale', name: 'Scale', seats: 40, status: 'Pendente' },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Heading variant="h4">{title}</Heading>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function UiShowcase() {
  const [plan, setPlan] = useState('growth')
  const [billing, setBilling] = useState('monthly')
  const [notify, setNotify] = useState(true)

  return (
    <main className="demo-page demo-page-wide flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="island-kicker">Design system</span>
        <Heading variant="h1">UI Kit</Heading>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Componentes shadcn/ui portados de <code>loytrustweb</code>, sobre
          Tailwind CSS v4 e TanStack Start.
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Icon name="download" />
            Com ícone
          </Button>
          <IconButton tooltip="Configurações">
            <Icon name="settings" size={16} />
          </IconButton>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Alerts">
        <div className="grid gap-3 md:grid-cols-2">
          <Alert>
            <Icon name="info" />
            <AlertTitle>Informação</AlertTitle>
            <AlertDescription>Tudo certo por aqui.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <Icon name="circle-check" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>Registro salvo com sucesso.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <Icon name="alert-triangle" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>Sua licença expira em 7 dias.</AlertDescription>
          </Alert>
          <Alert variant="danger">
            <Icon name="circle-alert" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>Não foi possível conectar.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Formulários">
        <Card>
          <CardHeader>
            <CardTitle>Nova conta</CardTitle>
            <CardDescription>
              Inputs, selects e controles com os tokens do trust.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" required>
                Nome
              </Label>
              <Input id="name" placeholder="Ada Lovelace" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="ada@exemplo.com" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="search">Busca</Label>
              <InputSearch id="search" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="plan">Plano</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Escreva algo..." />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Cobrança</Label>
              <RadioGroup value={billing} onValueChange={setBilling}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Mensal</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly">Anual</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="terms" defaultChecked />
                <Label htmlFor="terms">Aceito os termos</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="notify"
                  checked={notify}
                  onCheckedChange={setNotify}
                />
                <Label htmlFor="notify">Receber notificações</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={() => toast.success('Conta criada!')}>
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error('Operação cancelada')}
            >
              Cancelar
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogDescription>
                  Essa ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="danger">Excluir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Ações
                <Icon name="chevron-down" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-sm">Conteúdo flutuante ancorado no gatilho.</p>
            </PopoverContent>
          </Popover>

          <Tooltip text="Tooltip do design system">
            <Button variant="ghost">Passe o mouse</Button>
          </Tooltip>

          <Button variant="secondary" onClick={() => toast('Toast via sonner')}>
            Disparar toast
          </Button>
        </div>
      </Section>

      <Section title="Navegação e dados">
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="loading">Loading</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Assentos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PLANS.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>{item.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {item.name}
                    </TableCell>
                    <TableCell>{item.seats}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'Ativo' ? 'success' : 'warning'}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="faq">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Como troco de plano?</AccordionTrigger>
                <AccordionContent>
                  Em Configurações → Assinatura, escolha o novo plano.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Existe teste gratuito?</AccordionTrigger>
                <AccordionContent>Sim, 14 dias sem cartão.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="loading" className="flex flex-col gap-4">
            <LinearProgress />
            <LinearProgress indeterminate={false} percentage={62} color="success" />
            <Separator />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </main>
  )
}
