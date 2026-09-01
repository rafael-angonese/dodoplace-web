import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { ApiError } from '@/lib/api'

/** Mensagem de erro da API para contextos sem formulário. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.generalMessage ?? error.message
  }

  return 'Algo deu errado. Tente novamente.'
}

/**
 * Distribui os erros da API nos campos do formulário e devolve a mensagem
 * que sobra para exibir num alerta (credenciais inválidas, API fora do ar…).
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly Path<T>[],
): string | null {
  if (!(error instanceof ApiError)) {
    return 'Algo deu errado. Tente novamente.'
  }

  const fieldErrors = error.fieldErrors
  let matched = false

  for (const field of knownFields) {
    const message = fieldErrors[field]

    if (message) {
      matched = true
      setError(field, { type: 'server', message })
    }
  }

  const general = error.generalMessage
  if (general) {
    return general
  }

  // Erro de campo que o formulário não conhece: não pode sumir da tela.
  return matched ? null : error.message
}
