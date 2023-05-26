import { z } from "zod";
import { parsedDate } from "zodTypes";
import { validateNotEmpty } from "zodTypes/customValidators";
import {
  userDocument,
  userEmail,
  userName,
  userPassword,
  userPhone,
} from "zodTypes/user";

export const UserOnboardingSchema = z.object({
  name: userName,
  email: userEmail,
  phone: userPhone,
  document: userDocument,
  password: userPassword,
  birthday: parsedDate.optional(),
});

export const UserLoginSchema = z.object({
  document: userDocument,
  password: userPassword,
});

/**
 * Schema ZodJS para receber objeto visando ATUALIZAR os
 * dados de um cliente já presente no Banco de Dados.
 */
export const UserPatchSchema = z
  .object({
    name: userName,
    email: userName,
    phone: userPhone,
    birthday: parsedDate,
  })
  .partial()
  .superRefine(validateNotEmpty);

/**
 * Schema para atualizar a senha de usuário de um usuário
 * que esqueceu a sua senha anterior.
 */
export const UserNewPasswordSchema = z.object({
  password: userPassword,
});

export type UserOnboarding = z.infer<typeof UserOnboardingSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserPatch = z.infer<typeof UserPatchSchema>;
export type UserNewPassword = z.infer<typeof UserNewPasswordSchema>;
