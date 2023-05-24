import { UserPatchSchema } from "dtos/UsersDTO";
import { z } from "zod";
import { validateNotEmpty } from "zodTypes/customValidators";
import { userPassword } from "zodTypes/user";
import { AddressPatchSchema } from "./AddressDTO";

export const PatchSchema = z
  .object({
    user: UserPatchSchema,
    address: AddressPatchSchema,
  })
  .partial()
  .superRefine(validateNotEmpty);
export const UserPasswordPatchSchema = z.object({
  old_password: userPassword,
  new_password: userPassword,
});

export type Patch = z.infer<typeof PatchSchema>;
export type UserPasswordPatch = z.infer<typeof UserPasswordPatchSchema>;
