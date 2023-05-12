import { AddressOnboarding } from "dtos/AddressDTO";
import { PrismaTransactionalClient } from "types/index";

export async function onboardUserAddress(
  address: AddressOnboarding,
  owner_id: string,
  prisma: PrismaTransactionalClient,
) {
  await prisma.address.create({ data: { owner_id, ...address } });
}
