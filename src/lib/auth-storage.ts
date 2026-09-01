const TOKEN_KEY = 'mkt.auth.token'

/** Acesso ao token no localStorage, tolerante a SSR e a storage bloqueado. */
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
      // storage indisponível (aba anônima, cookies bloqueados)
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      // idem
    }
  },
}
