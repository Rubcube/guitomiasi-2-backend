import { z } from 'zod';
import { transactionPassword } from 'zodTypes/account';

export const AccountOnboardingSchema = z.object({
  transaction_password: transactionPassword
})

export type AccountOnboarding = z.infer<typeof AccountOnboardingSchema>;