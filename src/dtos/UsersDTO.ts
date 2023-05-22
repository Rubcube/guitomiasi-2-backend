import { z } from "zod";
import { parsedDate } from "zodTypes";
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
export const UserPutSchema = z
  .object({
    name: userName.optional(),
    email: userName.optional(),
    phone: userPhone.optional(),
    birthday: parsedDate.optional(),
  })
  .superRefine((obj, ctx) => {
    const atLeastOneDefined = Object.values(obj).some(v => v !== undefined);

    if (atLeastOneDefined) {
      return obj;
    } else {
      ctx.addIssue({
        code: "invalid_type",
        path: ["any"],
        expected: "object",
        received: "undefined",
      });
    }
  });

export type UserOnboarding = z.infer<typeof UserOnboardingSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserPut = z.infer<typeof UserPutSchema>;
