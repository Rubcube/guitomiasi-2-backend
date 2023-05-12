import { z } from "zod";
import { UserOnboardingSchema } from "./UsersDTO";
import { AddressOnboardingSchema } from "./AddressDTO";
import { AccountOnboardingSchema } from "./AccountDTO";

export const OnboardingSchema = z.object({
  user: UserOnboardingSchema,
  address: AddressOnboardingSchema,
  account: AccountOnboardingSchema,
});

export type Onboarding = z.infer<typeof OnboardingSchema>;
