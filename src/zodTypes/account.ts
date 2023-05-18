import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";
import { numericString } from ".";

export const transactionPassword = numericString("TP-INVALID-FORMAT").length(
  4,
  "TP-INVALID-LENGTH",
);
export const accountNumber = z.number().int().gt(0);
export const monetaryValue = z
  .number()
  .gt(0, "INVALID-VALUE")
  .transform(value => new Decimal(value).round());
