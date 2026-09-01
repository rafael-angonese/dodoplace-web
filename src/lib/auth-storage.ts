const TOKEN_KEY = 'mkt.auth.token'

export const authStorage = {
  get(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      return window.localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  set(token: string) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token)
    } catch {
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
    }
  },
}
