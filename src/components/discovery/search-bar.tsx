import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

const DEBOUNCE_MS = 350

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

  function submit(event: React.FormEvent) {
    event.preventDefault()
    push(query.trim())
  }

  const isCompact = variant === 'compact'

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-1 rounded-full border border-border bg-card p-2 shadow-sm transition-shadow hover:shadow-md"
    >
      <label
        className={cn(
          'flex w-full min-w-0 flex-col justify-center rounded-full px-5 py-2 hover:bg-accent/50',
          isCompact && 'py-1.5',
        )}
      >
        <span
          className={cn(
            'text-[11px] font-bold tracking-wide',
            isCompact && 'sr-only',
          )}
        >
          O que você precisa
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Eletricista, diarista, encanador..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
      </label>

      <span
        aria-hidden="true"
        className="ml-auto grid size-11 shrink-0 place-items-center rounded-full bg-brand-coral text-white"
      >
        <Search className="size-4" />
      </span>
    </form>
  )
}
