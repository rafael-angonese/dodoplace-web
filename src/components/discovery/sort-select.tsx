import type { ServiceSort } from '@/lib/services'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OPTIONS: { value: ServiceSort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'distance', label: 'Mais perto' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'recent', label: 'Mais recentes' },
]

export function SortSelect({
  value,
  onChange,
}: {
  value: ServiceSort
  onChange: (value: ServiceSort) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as ServiceSort)}>
      <SelectTrigger className="h-10 w-full rounded-full sm:w-52">
        <SelectValue placeholder="Ordenar" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
