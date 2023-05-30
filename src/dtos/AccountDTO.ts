import { z } from "zod";
import { transactionPassword } from "zodTypes/account";
import { validatePasswordNotEqual } from "zodTypes/customValidators";

export const AccountOnboardingSchema = z.object({
  transaction_password: transactionPassword,
});

export const AccountPasswordPatchSchema = z
  .object({
    old_password: transactionPassword,
    new_password: transactionPassword,
  })
  .superRefine(validatePasswordNotEqual);

export type AccountOnboarding = z.infer<typeof AccountOnboardingSchema>;
export type AccountPasswordPatch = z.infer<typeof AccountPasswordPatchSchema>;
