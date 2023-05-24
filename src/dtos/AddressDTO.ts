import { z } from "zod";
import {
  addressCEP,
  addressCity,
  addressComplement,
  addressNeighbourhood,
  addressNumber,
  addressState,
  addressStreet,
} from "zodTypes/address";
import { validateNotEmpty } from "zodTypes/customValidators";

export const AddressOnboardingSchema = z.object({
  cep: addressCEP,
  street: addressStreet,
  number: addressNumber,
  complement: addressComplement.optional(),
  neighbourhood: addressNeighbourhood,
  city: addressCity,
  state: addressState,
});

/**
 * Esquema de objeto recebido para PATCH do endereço.
 * `partial()` torna todos os campos do objeto de Onboarding opcionais.
 * `superRefine` verifica se pelo menos um campo está presente.
 */
export const AddressPatchSchema =
  AddressOnboardingSchema.partial().superRefine(validateNotEmpty);

export type AddressOnboarding = z.infer<typeof AddressOnboardingSchema>;
export type AddressPatch = z.infer<typeof AddressPatchSchema>;
