import { z } from "zod";
import { numericString } from ".";

export const addressCEP = numericString(
  "CEP contém caracteres que não são dígitos",
).length(8, "CEP não contém 8 dígitos");
export const addressStreet = z.string().max(120, "Rua excede 120 caracteres");
export const addressNumber = z.number().min(1, "Número da casa é menor que 1");
export const addressComplement = z
  .string()
  .max(300, "Complemento excede 300 caracteres");
export const addressNeighbourhood = z
  .string()
  .max(100, "Bairro excede 100 caracteres");
export const addressCity = z.string().max(100, "Cidade excede 100 caracteres");
export const addressState = z
  .string()
  .length(2, "Sigla do estado não possui 2 caracteres");
