import { TransferStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { DateTime } from "luxon";
import { prisma } from "prisma";

type ScheduledTransfer = {
  id: string;
  account_id_from: string;
  account_id_to: string;
  value: Decimal;
};

export async function getScheduledTransfers() {
  const today = DateTime.now();

  return await prisma.transfer.findMany({
    where: {
      transfer_status: TransferStatus.SCHEDULED,
      time_to_transfer: {
        lte: today.toJSDate(),
      },
    },
    orderBy: [{ time_to_transfer: "asc" }, { created_at: "asc" }],
    select: {
      id: true,
      account_id_from: true,
      account_id_to: true,
      value: true,
    },
  });
}

export async function executeScheduledTransfer(transfer: ScheduledTransfer) {
  return await prisma.$transaction(async prisma => {
    const oldBalance = (await prisma.account.findUnique({
      where: { id: transfer.account_id_from },
    }))!.balance;
    const newBalance = oldBalance?.minus(transfer.value);

    if (newBalance.isPositive()) {
      await prisma.account.update({
        where: { id: transfer.account_id_from },
        data: { balance: { decrement: transfer.value } },
      });

      await prisma.account.update({
        where: { id: transfer.account_id_to },
        data: { balance: { increment: transfer.value } },
      });

      return await prisma.transfer.update({
        where: { id: transfer.id },
        data: { transfer_status: TransferStatus.DONE },
      });
    } else {
      return await prisma.transfer.update({
        where: { id: transfer.id },
        data: { transfer_status: TransferStatus.CANCELED },
      });
    }
  });
}
