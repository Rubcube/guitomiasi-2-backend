import { z } from "zod";
import { accountNumber, transactionPassword } from "zodTypes/account";
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

export const VerifyAccountExistenceSchema = z.object({
  accountNumber: z.coerce.number().refine(accountNumber.parse),
});

export const validateAccountOwnershipSchema = z.object({
  accountId: z.string().uuid(),
});

export type AccountOnboarding = z.infer<typeof AccountOnboardingSchema>;
export type AccountPasswordPatch = z.infer<typeof AccountPasswordPatchSchema>;
export type VerifyAccountExistence = z.infer<
  typeof VerifyAccountExistenceSchema
>;
export type ValidateAccountOwnership = z.infer<
  typeof validateAccountOwnershipSchema
>;
