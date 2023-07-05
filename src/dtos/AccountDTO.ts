import { z } from "zod";
import { accountNumber, transactionPassword } from "zodTypes/account";
import { validatePasswordNotEqual } from "zodTypes/customValidators";
import { userDocument } from "zodTypes/user";

export const AccountOnboardingSchema = z.object({
  transaction_password: transactionPassword,
});

export const AccountPasswordPatchSchema = z
  .object({
    old_password: transactionPassword,
    new_password: transactionPassword,
  })
  .superRefine(validatePasswordNotEqual);

export const GetAssociatedUserSchema = z.object({
  accountNumber: z.coerce.number().refine(accountNumber.parse),
});

export const validateAccountOwnershipSchema = z.object({
  accountId: z.string().uuid(),
});

export const GetUserAccounts = z.object({
  document: userDocument,
});

export type AccountOnboarding = z.infer<typeof AccountOnboardingSchema>;
export type AccountPasswordPatch = z.infer<typeof AccountPasswordPatchSchema>;
export type GetAssociatedUser = z.infer<typeof GetAssociatedUserSchema>;
export type ValidateAccountOwnership = z.infer<
  typeof validateAccountOwnershipSchema
>;
export type GetUserAccounts = z.infer<typeof GetUserAccounts>;
