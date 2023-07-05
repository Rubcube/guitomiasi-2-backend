import { z } from "zod";
import { parsedDate } from "zodTypes";
import {
  validateNotEmpty,
  validatePasswordNotEqual,
} from "zodTypes/customValidators";
import {
  userDocument,
  userEmail,
  userName,
  userPassword,
  userPhone,
  userResetPasswordToken,
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

export const UserPatchSchema = z
  .object({
    name: userName,
    email: userName,
    phone: userPhone,
    birthday: parsedDate,
  })
  .partial()
  .superRefine(validateNotEmpty);

export const UserPasswordPatchSchema = z
  .object({
    old_password: userPassword,
    new_password: userPassword,
  })
  .superRefine(validatePasswordNotEqual);

export const UserNewPasswordSchema = z.object({
  document: userDocument,
  new_password: userPassword,
  token: userResetPasswordToken,
});

export const UserForgotPasswordSchema = z.object({
  document: userDocument,
});

export type UserOnboarding = z.infer<typeof UserOnboardingSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserPatch = z.infer<typeof UserPatchSchema>;
export type UserPasswordPatch = z.infer<typeof UserPasswordPatchSchema>;
export type UserNewPassword = z.infer<typeof UserNewPasswordSchema>;
export type UserForgotPassword = z.infer<typeof UserForgotPasswordSchema>;
