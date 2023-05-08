import { PrismaClient } from '@prisma/client';
import { AddressOnboarding } from 'dtos/AddressDTO';

const prisma = new PrismaClient();

export default class AddressModel {
  create = async (address: AddressOnboarding) => {
    return await prisma.address.create({
      data: address
    })
  }
};
