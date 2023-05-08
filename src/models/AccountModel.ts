import { PrismaClient } from '@prisma/client';
import { AccountOnboarding } from 'dtos/AccountDTO';

const prisma = new PrismaClient();

export default class AddressModel {
  create = async (account: AccountOnboarding) => {
    return await prisma.account.create({
      data: {
        bcrypt_transaction_password: account.bcrypt_transaction_password,
        owner_id: account.owner_id,
        account_number: Math.floor(Math.random() * 10000000),
        agency: 1,
        balance: 0,
      }
    })
  }
};
