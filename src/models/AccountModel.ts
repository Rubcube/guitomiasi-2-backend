import { AccountOnboarding } from "dtos/AccountDTO";
import { PrismaTransactionalClient } from "types/index";
import { hash } from "bcrypt";
import { Prisma, PrismaClient, TransferStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const ACCOUNT_DEFAULT_OPTIONS = {
  agency: 1,
  balance: 100,
};

export async function getAccountAndUser(accountID: string) {
  return await prisma.account.findUnique({
    where: { id: accountID },
    include: { user: true },
  });
}

export async function getAccountTransfers(
  accountID: string,
  start?: Date,
  end?: Date,
) {
  const account = await prisma.account.findUnique({
    where: { id: accountID },
    include: {
      sent_transfers: {
        where: {
          transfer_status: TransferStatus.DONE,
          updated_at: { lte: end, gte: start },
        },
        orderBy: [{ updated_at: "desc" }],
        select: {
          id: true,
          account_id_to: true,
          value: true,
          updated_at: true,
        },
      },
      received_transfers: {
        where: {
          transfer_status: TransferStatus.DONE,
          updated_at: { lte: end, gte: start },
        },
        orderBy: [{ updated_at: "desc" }],
        select: {
          id: true,
          account_id_from: true,
          value: true,
          updated_at: true,
        },
      },
    },
  });

  const sentTransfers = await Promise.all(
    account!.sent_transfers.map(async transfer => {
      const accountTo = await prisma.$queryRaw(Prisma.sql`
    SELECT a.account_number, ui.name, ui.email, ui.phone
    FROM ("Account" a INNER JOIN "UserInfo" ui ON a.owner_id = ui.id)
    WHERE a.id = ${transfer.account_id_to}::uuid
    `);

      return {
        id: transfer.id,
        to: accountTo,
        value: transfer.value,
        time: transfer.updated_at,
      };
    }),
  );

  const receivedTransfers = await Promise.all(
    account!.received_transfers.map(async transfer => {
      const accountFrom: {
        account_number: number;
        email: string;
        name: string;
        phone: string;
      } = await prisma.$queryRaw(Prisma.sql`
    SELECT a.account_number, ui.name, ui.email, ui.phone
    FROM ("Account" a INNER JOIN "UserInfo" ui ON a.owner_id = ui.id)
    WHERE a.id = ${transfer.account_id_from}::uuid
    `);

      return {
        id: transfer.id,
        from: accountFrom,
        value: transfer.value,
        time: transfer.updated_at,
      };
    }),
  );

  return {
    sent: sentTransfers,
    received: receivedTransfers,
  };
}

export async function onboardUserAccount(
  account: AccountOnboarding,
  owner_id: string,
  prisma: PrismaTransactionalClient,
) {
  const { transaction_password } = account;
  const bcrypt_transaction_password = await hash(transaction_password, 10);

  await prisma.account.create({
    data: {
      owner_id,
      bcrypt_transaction_password,
      ...ACCOUNT_DEFAULT_OPTIONS,
    },
  });
}
