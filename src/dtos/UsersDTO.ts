import { z } from 'zod';
import { bcryptHash, parsedDate } from 'zodTypes';
import { userDocument, userEmail, userName, userPassword, userPhone } from 'zodTypes/user';

export const UserOnboardingSchema = z.object({
  name: userName,
  email: userEmail,
  phone: userPhone,
  document: userDocument,
  password: userPassword,
  birthday: parsedDate.optional()
})

export const UserLoginSchema = z.object({
  document: userDocument,
  bcrypt_user_password: bcryptHash
})

export const UserOutSchema = z.object({
  id: z.string().uuid(),
  name: userName,
  document: userDocument,
  email: userEmail,
  phone: userPhone,
  birthday: z.date().optional()
})

export type UserOnboarding = z.infer<typeof UserOnboardingSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserOutSchema = z.infer<typeof UserOutSchema>;
