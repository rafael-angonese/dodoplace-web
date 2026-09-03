import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatedPlaceholderInput } from '@/components/ui/animated-placeholder-input'

const DEBOUNCE_MS = 350

const PLACEHOLDERS = [
  'Eletricista para instalar chuveiro',
  'Diarista para faxina semanal',
  'Encanador para vazamento na pia',
  'Pintor para dois quartos',
  'Montador de móveis',
  'Jardineiro para poda de árvore',
]

export function SearchBar({
  defaultQuery = '',
  category,
  variant = 'hero',
}: {
  defaultQuery?: string
  category?: string
  variant?: 'hero' | 'compact'
}) {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [query, setQuery] = useState(defaultQuery)
  const applied = useRef(defaultQuery)

  const push = useCallback(
    (next: string) => {
      applied.current = next

      navigate({
        to: '/',
        search: (current) => ({
          ...current,
          q: next || undefined,
          category,
        }),
        replace: pathname === '/',
      })
    },
    [navigate, category, pathname],
  )

  useEffect(() => {
    if (defaultQuery !== applied.current) {
      applied.current = defaultQuery
      setQuery(defaultQuery)
    }
  }, [defaultQuery])

  useEffect(() => {
    const next = query.trim()

    if (next === applied.current) {
      return
    }

    const timeout = setTimeout(() => push(next), DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [query, push])

  return (
    <AnimatedPlaceholderInput
      placeholders={PLACEHOLDERS}
      label="O que você precisa"
      labelHidden={variant === 'compact'}
      value={query}
      onChange={setQuery}
      onSubmit={push}
    />
  )
}
