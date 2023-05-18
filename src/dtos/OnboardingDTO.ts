import { z } from "zod";
import { AccountOnboardingSchema } from "./AccountDTO";
import { AddressOnboardingSchema } from "./AddressDTO";
import { UserOnboardingSchema } from "./UsersDTO";

export const OnboardingSchema = z.object({
  user: UserOnboardingSchema,
  address: AddressOnboardingSchema,
  account: AccountOnboardingSchema,
});

export type Onboarding = z.infer<typeof OnboardingSchema>;
