import { AccountStatus, Prisma, TransferStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { RubError } from "handlers/errors/RubError";
import { prisma } from "prisma";

const TRANSFER_PAGINATION_OPTIONS = {
  pageSize: 10,
};

export const ACCOUNT_DEFAULT_OPTIONS = {
  agency: 1,
  balance: 100,
};

/**
 * Número de tentativas de transferência até bloqueio da conta.
 */
export const ACCOUNT_MAXIMUM_ATTEMPTS = 3;

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
  direction: "IN" | "OUT" | "BOTH";
  page: number;
  start?: Date;
  end?: Date;
};

/**
 * Recupera lista de transferências recebidas e realizadas
 * por uma determinada conta a partir do banco de dados.
 */
export async function getTransfers({
  accountID,
  direction,
  page,
  start,
  end,
}: getTransfersParams) {
  const whereOutQuery: Prisma.TransferWhereInput = {
    account_id_from: accountID,
  };
  const whereInQuery: Prisma.TransferWhereInput = {
    account_id_to: accountID,
  };
  let usedWhereQuery;

  if (direction === "IN") {
    usedWhereQuery = [whereInQuery];
  } else if (direction === "OUT") {
    usedWhereQuery = [whereOutQuery];
  } else {
    usedWhereQuery = [whereInQuery, whereOutQuery];
  }

  const transfers = await prisma.transfer.findMany({
    where: {
      OR: usedWhereQuery,
      transfer_status: TransferStatus.DONE,
      updated_at: { lte: end, gte: start },
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
    },
  });

  return {
    transfers: transfers.map(transfer => ({
      id: transfer.id,
      value: transfer.value,
      direction: transfer.account_id_from === accountID ? "OUT" : "IN",
      time: transfer.updated_at,
      status: TransferStatus.DONE,
    })),
  };
}

/**
 * Retorna todas as transferências AGENDADAS
 * por uma determinada conta.
 */
export async function getScheduledTransfers({
  accountID,
  page,
  start,
  end,
}: Omit<getTransfersParams, "direction">) {
  const transfers = await prisma.transfer.findMany({
    where: {
      account_id_from: accountID,
      transfer_status: TransferStatus.SCHEDULED,
      time_to_transfer: { lte: end, gte: start },
    },
    orderBy: { updated_at: "desc" },
    skip: page * TRANSFER_PAGINATION_OPTIONS.pageSize,
    take: TRANSFER_PAGINATION_OPTIONS.pageSize,
    select: {
      id: true,
      account_id_from: true,
      account_id_to: true,
      value: true,
      time_to_transfer: true,
    },
  });

  return {
    transfers: transfers.map(transfer => ({
      id: transfer.id,
      value: transfer.value,
      time: transfer.time_to_transfer,
      direction: "OUT",
      status: TransferStatus.SCHEDULED,
    })),
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
      "Não foi possível realizar transferência: conta de destino não existe",
      "CREDITED-ACCOUNT-NOT-FOUND",
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
          "Saldo insuficiente para realizar essa transferência",
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
      "Não foi possível realizar transferência: conta de destino não existe",
      "CREDITED-ACCOUNT-NOT-FOUND",
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

/**
 * Incrementa número de tentativas de transação de uma determinada conta.
 * Isso é feito quando a senha transacional inserida não é correta.
 * Caso haja 3 tentativas incorretas, a conta é bloqueada.
 * @returns Status da conta
 */
export async function incrementAttempt(id: string) {
  const newAccount = await prisma.account.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });

  let newStatus = newAccount.account_status;
  if (newAccount.attempts === 3) {
    newStatus = AccountStatus.BLOCKED;
  }

  return (
    await prisma.account.update({
      where: { id },
      data: { account_status: newStatus },
    })
  ).account_status;
}

/**
 * Reseta número de tentativas de transação de uma determinada conta.
 * É chamada sempre que o usuário ACERTA a senha transacional.
 */
export async function resetAttempts(id: string) {
  await prisma.account.update({
    where: { id },
    data: { attempts: 0 },
  });
}

/**
 * Atualiza o hash da senha transacional de uma determinada conta
 * @param id UUID da conta que terá seu hash alterado
 * @param newPasswordHash Novo hash de senha transacional
 */
export async function patchPassword(id: string, newPasswordHash: string) {
  return await prisma.account.update({
    where: { id },
    data: { bcrypt_transaction_password: newPasswordHash },
  });
}
