import { z } from "zod";
import { parsedDate } from "zodTypes/index";
import { userDocument, userEmail, userName, userPhone } from "zodTypes/user";
import { AccountOnboardingSchema } from "./AccountDTO";
import { AddressOnboardingSchema } from "./AddressDTO";
import { UserOnboardingSchema } from "./UsersDTO";

export const OnboardingUserStepValidationSchema = z.object({
  name: userName,
  email: userEmail,
  phone: userPhone,
  document: userDocument,
  birthday: parsedDate,
});

export const OnboardingSchema = z.object({
  user: UserOnboardingSchema,
  address: AddressOnboardingSchema,
  account: AccountOnboardingSchema,
});

export type Onboarding = z.infer<typeof OnboardingSchema>;
export type OnboardingUserStepValidation = z.infer<
  typeof OnboardingUserStepValidationSchema
>;
