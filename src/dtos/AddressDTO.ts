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

export const AddressOnboardingSchema = z.object({
  cep: addressCEP,
  street: addressStreet,
  number: addressNumber,
  complement: addressComplement.optional(),
  neighbourhood: addressNeighbourhood,
  city: addressCity,
  state: addressState,
});

export type AddressOnboarding = z.infer<typeof AddressOnboardingSchema>;
