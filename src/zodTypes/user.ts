import { z } from "zod";
import { numericString } from ".";
import { validateCNPJ, validateCPF } from "./customValidators";

export const userName = z.string().max(200, "USERNAME-INVALID-LENGTH");
export const userEmail = z
  .string()
  .email("EMAIL-INVALID-FORMAT")
  .max(320, "EMAIL-INVALID-LENGTH");
export const userPhone = numericString("PHONE-INVALID-FORMAT").max(
  13,
  "PHONE-INVALID-LENGTH",
);
const userCPF = numericString("CPF-INVALID-FORMAT")
  .length(11, "CPF-INVALID-LENGTH")
  .refine(validateCPF, "CPF-INVALID-VALUE");
const userCNPJ = numericString("CNPJ-INVALID-FORMAT")
  .length(14, "CNPJ-INVALID-LENGTH")
  .refine(validateCNPJ, "CNPJ-INVALID-VALUE");
export const userDocument = userCPF.or(userCNPJ);
export const userPassword = z
  .string()
  .min(8, "PASSWORD-INVALID-LENGTH")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    "PASSWORD-INVALID-FORMAT",
  );
