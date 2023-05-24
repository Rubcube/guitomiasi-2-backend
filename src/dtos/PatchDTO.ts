import { UserPatchSchema } from "dtos/UsersDTO";
import { z } from "zod";
import { validateNotEmpty } from "zodTypes/customValidators";
import { AddressPatchSchema } from "./AddressDTO";

export const PatchSchema = z
  .object({
    user: UserPatchSchema,
    address: AddressPatchSchema,
  })
  .partial()
  .superRefine(validateNotEmpty);

export type Patch = z.infer<typeof PatchSchema>;
