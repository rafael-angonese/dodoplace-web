import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'

export type Theme = 'dark' | 'light' | 'system'

export const THEME_STORAGE_KEY = 'theme'

type ThemeProviderProps = {
	children: React.ReactNode
	defaultTheme?: Theme
	storageKey?: string
}

type ThemeProviderState = {
	theme: Theme
	resolvedTheme: 'dark' | 'light'
	isDarkMode: boolean
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const initialState: ThemeProviderState = {
	theme: 'system',
	resolvedTheme: 'light',
	isDarkMode: false,
	setTheme: () => null,
	toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark' || value === 'system'
}

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
	if (typeof window === 'undefined') {
		return fallback
	}

	try {
		const stored = window.localStorage.getItem(storageKey)
		return isTheme(stored) ? stored : fallback
	} catch {
		return fallback
	}
}

function prefersDark() {
	if (typeof window === 'undefined') {
		return false
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme: Theme, systemIsDark: boolean) {
	const resolved = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme
	const root = document.documentElement

	root.classList.remove('light', 'dark')
	root.classList.add(resolved)

	if (theme === 'system') {
		root.removeAttribute('data-theme')
	} else {
		root.setAttribute('data-theme', theme)
	}

	root.style.colorScheme = resolved
}

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme)
	const [systemIsDark, setSystemIsDark] = useState(false)

	useEffect(() => {
		setThemeState(readStoredTheme(storageKey, defaultTheme))
		setSystemIsDark(prefersDark())
	}, [defaultTheme, storageKey])

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const onChange = (event: MediaQueryListEvent) => {
			setSystemIsDark(event.matches)
		}

		media.addEventListener('change', onChange)
		return () => media.removeEventListener('change', onChange)
	}, [])

	useEffect(() => {
		applyTheme(theme, systemIsDark)
	}, [theme, systemIsDark])

	const setTheme = useCallback(
		(nextTheme: Theme) => {
			setThemeState(nextTheme)

			try {
				window.localStorage.setItem(storageKey, nextTheme)
			} catch {
			}
		},
		[storageKey]
	)

	const resolvedTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme

	const value = useMemo<ThemeProviderState>(() => {
		return {
			theme,
			resolvedTheme,
			isDarkMode: resolvedTheme === 'dark',
			setTheme,
			toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
		}
	}, [theme, resolvedTheme, setTheme])

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext)

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}

	return context
}
