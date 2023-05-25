import { z } from "zod";
import { transactionPassword } from "zodTypes/account";

export const AccountOnboardingSchema = z.object({
  transaction_password: transactionPassword,
});

export const AccountPatchSchema = z.object({
  old_password: transactionPassword,
  new_password: transactionPassword,
});

export type AccountOnboarding = z.infer<typeof AccountOnboardingSchema>;
export type AccountPatch = z.infer<typeof AccountPatchSchema>;
