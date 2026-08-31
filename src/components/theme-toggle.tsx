import { Monitor, Moon, Sun } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { type Theme, useTheme } from '@/providers/theme-context'

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

const ICON_BY_THEME = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const LABEL_BY_THEME: Record<Theme, string> = {
  light: 'Tema claro',
  dark: 'Tema escuro',
  system: 'Tema do sistema',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const ThemeIcon = ICON_BY_THEME[theme]

  return (
    <IconButton
      tooltip={LABEL_BY_THEME[theme]}
      aria-label={`${LABEL_BY_THEME[theme]}. Clique para alternar.`}
      onClick={() => setTheme(NEXT_THEME[theme])}
      className="h-10 w-10 rounded-xl"
    >
      <ThemeIcon aria-hidden="true" className="size-4" />
    </IconButton>
  )
}
