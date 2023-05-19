import { PrismaClient, TransferStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { RubError } from "handlers/errors/RubError";

const prisma = new PrismaClient();

const TRANSFER_PAGINATION_OPTIONS = {
  pageSize: 10,
};

export const ACCOUNT_DEFAULT_OPTIONS = {
  agency: 1,
  balance: 100,
};

/**
 * Recupera uma conta do banco de dados a partir de seu ID.
 * Também pode retornar usuário associado à conta.
 */
export async function getAccount(accountID: string, includeUser = true) {
  return await prisma.account.findUnique({
    where: { id: accountID },
    include: { user: includeUser },
  });
}

type getTransfersParams = {
  accountID: string;
  page?: number;
  start?: Date;
  end?: Date;
};

/**
 * Recupera lista de transferências recebidas e realizadas
 * por uma determinada conta a partir do banco de dados.
 */
export async function getTransfers({
  accountID,
  page = 0,
  start,
  end,
}: getTransfersParams) {
  const transfers = await prisma.transfer.findMany({
    where: {
      OR: [
        {
          account_id_from: accountID,
          OR: [
            {
              transfer_status: TransferStatus.DONE,
              updated_at: { lte: end, gte: start },
            },
            {
              transfer_status: TransferStatus.SCHEDULED,
              time_to_transfer: { lte: end, gte: start },
            },
          ],
        },
        {
          account_id_to: accountID,
          transfer_status: TransferStatus.DONE,
          updated_at: { lte: end, gte: start },
        },
      ],
    },
    orderBy: { updated_at: "desc" },
    skip: page * TRANSFER_PAGINATION_OPTIONS.pageSize,
    take: TRANSFER_PAGINATION_OPTIONS.pageSize,
    select: {
      id: true,
      account_id_from: true,
      account_id_to: true,
      value: true,
      updated_at: true,
      time_to_transfer: true,
      transfer_status: true,
    },
  });

  const sent = transfers.filter(
    transfer => transfer.account_id_from === accountID,
  );

  const received = transfers.filter(
    transfer => transfer.account_id_to === accountID,
  );

  // If transfer is scheduled, substitute `time_to_transfer` instead of `updated_at`
  const mappedSent = sent.map(sentTransfer => ({
    id: sentTransfer.id,
    status: sentTransfer.transfer_status,
    value: sentTransfer.value,
    time:
      sentTransfer.transfer_status === "DONE"
        ? sentTransfer.updated_at
        : sentTransfer.time_to_transfer,
  }));

  const mappedReceived = received.map(receivedTransfer => ({
    id: receivedTransfer.id,
    status: TransferStatus.DONE,
    value: receivedTransfer.value,
    time: receivedTransfer.updated_at,
  }));

  return {
    sent: mappedSent,
    received: mappedReceived,
  };
}

/**
 * Retorna informações detalhadas de uma transferência a partir do banco de dados.
 */
export async function getTransferDetail(transferId: string) {
  return await prisma.transfer.findUnique({
    where: { id: transferId },
    include: {
      credited_account: {
        include: {
          user: {
            include: {
              user_info: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      debited_account: {
        include: {
          user: {
            include: {
              user_info: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Tenta realizar uma transferência IMEDIATAMENTE.
 *
 * Caso obtenha sucesso -> Cria nova transferência com status DONE
 * Caso falhe -> Cria nova transferência com status FAILED
 */
export async function makeTransfer(
  account_id_from: string,
  account_number_to: number,
  value: Decimal,
) {
  const account_to = await prisma.account.findUnique({
    where: { account_number: account_number_to },
  });

  if (account_to === null) {
    throw new RubError(
      404,
      "CREDITED-ACCOUNT-NOT-FOUND",
      "Can't execute a transfer to an account that don't exist",
    );
  }

  try {
    return await prisma.$transaction(async prisma => {
      const newBalance = (
        await prisma.account.update({
          where: { id: account_id_from },
          data: { balance: { decrement: value } },
          select: { balance: true },
        })
      ).balance;

      if (newBalance.isNegative()) {
        throw new RubError(
          500,
          "Not enough money to make the transfer",
          "TRANSFER-NOT-ENOUGH-BALANCE",
        );
      }

      await prisma.account.update({
        where: { id: account_to.id },
        data: { balance: { increment: value } },
        select: { id: true },
      });

      const generatedTransfer = await prisma.transfer.create({
        data: {
          account_id_from,
          account_id_to: account_to.id,
          value,
        },
      });

      return generatedTransfer;
    });
  } catch (e) {
    if (!(e instanceof RubError)) {
      await prisma.transfer.create({
        data: {
          account_id_from,
          account_id_to: account_to.id,
          value,
          transfer_status: TransferStatus.CANCELED,
        },
      });
    }

    throw e;
  }
}

/**
 * Tenta realizar o agendamento de uma transferência.
 */
export async function scheduleTransfer(
  account_id_from: string,
  account_number_to: number,
  value: Decimal,
  time_to_transfer: Date,
) {
  const account_to = await prisma.account.findUnique({
    where: { account_number: account_number_to },
  });

  if (account_to === null) {
    throw new RubError(
      404,
      "CREDITED-ACCOUNT-NOT-FOUND",
      "Can't execute a transfer to an account that don't exist",
    );
  }

  return await prisma.transfer.create({
    data: {
      account_id_from,
      account_id_to: account_to.id,
      value,
      transfer_status: TransferStatus.SCHEDULED,
      time_to_transfer,
    },
  });
}
