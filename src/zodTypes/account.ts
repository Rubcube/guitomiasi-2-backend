import { z } from "zod";
import { numericString } from ".";

export const transactionPassword = numericString(
  "Senha de transação só deve conter números",
).length(4);
export const accountNumber = z.number().int().gt(0);
