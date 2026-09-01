import { z } from 'zod'

const email = z
  .email('Informe um e-mail válido.')
  .max(254, 'O e-mail pode ter no máximo 254 caracteres.')

const name = z
  .string()
  .trim()
  .min(2, 'O nome precisa ter ao menos 2 caracteres.')
  .max(120, 'O nome pode ter no máximo 120 caracteres.')

export const signInSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').pipe(email),
})

export const signUpSchema = z.object({
  name,
  email: z.string().min(1, 'Informe seu e-mail.').pipe(email),
})

export const profileSchema = z.object({
  name: z.union([z.literal(''), name]),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ProfileValues = z.infer<typeof profileSchema>
