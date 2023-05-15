import { z } from "zod";
import { numericString } from ".";

export const addressCEP = numericString("CEP-INVALID-FORMAT").length(
  8,
  "CEP-INVALID-LENGTH",
);
export const addressStreet = z.string().max(120, "STREET-INVALID-LENGTH");
export const addressNumber = z.number().min(1, "NUMBER-INVALID-VALUE");
export const addressComplement = z
  .string()
  .max(300, "COMPLEMENT-INVALID-LENGTH");
export const addressNeighbourhood = z
  .string()
  .max(100, "NEIGHBOURHOOD-INVALID-LENGTH");
export const addressCity = z.string().max(100, "CITY-INVALID-LENGTH");
export const addressState = z.string().length(2, "STATE-INVALID-LENGTH");
