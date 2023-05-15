import { z } from "zod";
import { numericString } from ".";

export const transactionPassword = numericString("TP-INVALID-FORMAT").length(
  4,
  "TP-INVALID-LENGTH",
);
export const accountNumber = z.number().int().gt(0);
