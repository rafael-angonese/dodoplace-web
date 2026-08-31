export type DiscoveryCategory = {
  id: string
  slug: string
  name: string
}

/**
 * Layout-only: espelha o seed de categorias do FazPerto. Numa versão
 * integrada isso viraria uma consulta à API.
 *
 * O `name` é exibido no singular; o `slug` segue o do seed (plural) para não
 * quebrar as URLs de `/buscar?categoria=...`.
 */
export const CATEGORIES: DiscoveryCategory[] = [
  { id: '1', slug: 'pintores', name: 'Pintor' },
  { id: '2', slug: 'eletricistas', name: 'Eletricista' },
  { id: '3', slug: 'encanadores', name: 'Encanador' },
  { id: '4', slug: 'montadores-de-moveis', name: 'Montador de móveis' },
  { id: '5', slug: 'faxina', name: 'Faxina' },
  { id: '6', slug: 'fretes', name: 'Frete e mudança' },
  { id: '7', slug: 'pedreiros', name: 'Pedreiro' },
  { id: '8', slug: 'ar-condicionado', name: 'Ar-condicionado' },
  { id: '9', slug: 'jardinagem', name: 'Jardinagem' },
  { id: '10', slug: 'marcenaria', name: 'Marcenaria' },
  { id: '11', slug: 'reformas', name: 'Reforma' },
]

export function categoryLabel(slug: string) {
  const known = CATEGORIES.find((category) => category.slug === slug)
  if (known) {
    return known.name
  }

  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
