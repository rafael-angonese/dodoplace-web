import { z } from 'zod'

/**
 * Schemas dos formulários de acesso e perfil.
 *
 * Espelham os validators VineJS da API (`app/validators/user.ts`) para dar
 * retorno imediato — a API continua sendo a fonte de verdade, e os erros que só
 * ela conhece chegam pelo `applyApiErrors`.
 *
 * Não há senha: o acesso é por magic link.
 */

const email = z
  .email('Informe um e-mail válido.')
  .max(254, 'O e-mail pode ter no máximo 254 caracteres.')

const name = z
  .string()
  .trim()
  .min(2, 'O nome precisa ter ao menos 2 caracteres.')
  .max(120, 'O nome pode ter no máximo 120 caracteres.')

/** Entrar: basta o e-mail. */
export const signInSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').pipe(email),
})

/** Criar conta: nome + e-mail. O nome só é usado se a conta ainda não existe. */
export const signUpSchema = z.object({
  name,
  email: z.string().min(1, 'Informe seu e-mail.').pipe(email),
})

/** O nome é opcional no perfil: em branco significa "sem nome" (null na API). */
export const profileSchema = z.object({
  name: z.union([z.literal(''), name]),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ProfileValues = z.infer<typeof profileSchema>
