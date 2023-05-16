import { z } from "zod";
import { accountNumber, monetaryValue } from "zodTypes/account";

export const TransferInSchema = z.object({
  account_number_to: accountNumber,
  value: monetaryValue,
});

export type TransferIn = z.infer<typeof TransferInSchema>;
