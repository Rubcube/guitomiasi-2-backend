import { z } from "zod";
import {
  accountNumber,
  monetaryValue,
  transactionPassword,
} from "zodTypes/account";

export const TransferInSchema = z.object({
  account_number_to: accountNumber,
  value: monetaryValue,
  transactional_password: transactionPassword,
});

export type TransferIn = z.infer<typeof TransferInSchema>;
