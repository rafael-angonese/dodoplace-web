import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { type Theme, useTheme } from '@/providers/theme-context'

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

const ICON_BY_THEME = {
  light: 'sun',
  dark: 'moon',
  system: 'monitor',
} as const

const LABEL_BY_THEME: Record<Theme, string> = {
  light: 'Tema claro',
  dark: 'Tema escuro',
  system: 'Tema do sistema',
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <IconButton
      tooltip={LABEL_BY_THEME[theme]}
      aria-label={`${LABEL_BY_THEME[theme]}. Clique para alternar.`}
      onClick={() => setTheme(NEXT_THEME[theme])}
      className="h-9 w-9 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] hover:bg-[var(--link-bg-hover)]"
    >
      <Icon name={ICON_BY_THEME[theme]} size={16} />
    </IconButton>
  )
}
