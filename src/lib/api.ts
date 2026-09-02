const DEFAULT_BASE_URL = 'http://localhost:3333/api/v1'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? DEFAULT_BASE_URL

export type ApiErrorItem = {
  message: string
  rule?: string
  field?: string
  meta?: Record<string, unknown>
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: ApiErrorItem[]

  constructor(status: number, errors: ApiErrorItem[]) {
    super(errors[0]?.message ?? 'Não foi possível concluir a operação.')
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  get fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {}

    for (const error of this.errors) {
      if (error.field && !result[error.field]) {
        result[error.field] = error.message
      }
    }

    return result
  }

  get generalMessage(): string | null {
    const general = this.errors.find((error) => !error.field)
    return general?.message ?? null
  }
}

function parseErrors(payload: unknown, status: number): ApiErrorItem[] {
  if (
    payload &&
    typeof payload === 'object' &&
    'errors' in payload &&
    Array.isArray((payload as { errors: unknown }).errors)
  ) {
    return (payload as { errors: ApiErrorItem[] }).errors
  }

  return [{ message: `Erro inesperado da API (HTTP ${status}).` }]
}

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

function encodeBody(body: unknown) {
  if (body === undefined) {
    return undefined
  }

  return body instanceof FormData ? body : JSON.stringify(body)
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token, signal }: ApiRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: encodeBody(body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(0, [
      { message: 'Não foi possível conectar à API. Verifique se ela está no ar.' },
    ])
  }

  const raw = await response.text()
  const payload = raw ? (JSON.parse(raw) as unknown) : null

  if (!response.ok) {
    throw new ApiError(response.status, parseErrors(payload, response.status))
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }

  return payload as T
}
