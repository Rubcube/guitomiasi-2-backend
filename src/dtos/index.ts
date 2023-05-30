import { UserPatchSchema } from "dtos/UsersDTO";
import { z } from "zod";
import { validateNotEmpty } from "zodTypes/customValidators";
import { AddressOnboardingSchema } from "./AddressDTO";

export const PatchSchema = z
  .object({
    user: UserPatchSchema,
    address: AddressOnboardingSchema,
  })
  .partial()
  .superRefine(validateNotEmpty);

export type Patch = z.infer<typeof PatchSchema>;
