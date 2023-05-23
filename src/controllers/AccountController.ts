import {
  Account,
  AccountStatus,
  Transfer,
  TransferStatus,
} from "@prisma/client";
import { compare } from "bcrypt";
import { TransferIn, TransferOut } from "dtos/TransferDTO";
import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import { DateTime } from "luxon";
import * as AccountModel from "models/AccountModel";
import moment from "moment";

/**
 * Retorna saldo atual de uma determinada conta.
 */
export async function getBalance(req: Request, res: Response) {
  const account: Account = res.locals.account;

  return res.status(200).json({
    balance: account.balance,
  });
}

/**
 * Retorna lista de transferências recebidas e realizadas
 * por uma determinada conta.
 */
export async function getTransfers(req: Request, res: Response) {
  const accountID = req.params.accountId;
  const { status, direction, page, start, end }: TransferOut =
    res.locals.parsedQuery;
  let transfers;

  if (status === "DONE") {
    transfers = await AccountModel.getTransfers({
      accountID,
      direction,
      page,
      start,
      end,
    });
  } else {
    transfers = await AccountModel.getScheduledTransfers({
      accountID,
      page,
      start,
      end,
    });
  }

  return res.status(200).json(transfers);
}

/**
 * Retorna informações detalhadas de uma determinada transferência.
 */
export async function getTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const transferId: string = req.params.transferId;

  const transfer = await AccountModel.getTransferDetail(transferId);

  if (!transfer) {
    return next(
      new RubError(404, "Transfer don't exist", "TRANSFER-NOT-FOUND"),
    );
  }

  // Retrieve ID from JWT
  const userId: string = res.locals.parsedJWTToken.id;
  // Fetch both sender and receiver accounts, check if user is related to one of them
  const senderAccount = await AccountModel.getAccount(transfer.account_id_from);
  const receiverAccount = await AccountModel.getAccount(transfer.account_id_to);

  const isSender = senderAccount!.user.id === userId;
  const isReceiver = receiverAccount!.user.id === userId;
  if (!isSender && !isReceiver) {
    return next(
      new RubError(
        403,
        "User is neither sender nor receiver",
        "TRANSFER-FORBIDDEN-ACCESS",
      ),
    );
  }

  let timeOfTransfer: Date;
  if (transfer.transfer_status === TransferStatus.DONE) {
    timeOfTransfer = transfer.updated_at;
  } else if (transfer.transfer_status === TransferStatus.SCHEDULED) {
    timeOfTransfer = moment(transfer.time_to_transfer).startOf("day").toDate();
  } else {
    timeOfTransfer = moment(transfer.updated_at)
      .startOf("day")
      .add(1, "day")
      .toDate();
  }

  return res.status(200).json({
    status: transfer.transfer_status,
    value: transfer.value,
    time_of_transfer: timeOfTransfer,
    direction: isReceiver ? "IN" : "OUT",
    from: {
      number: transfer.debited_account.account_number,
      agency: transfer.debited_account.agency,
      name: transfer.debited_account.user.user_info!.name,
      email: transfer.debited_account.user.user_info!.email,
      phone: transfer.debited_account.user.user_info!.phone,
    },
    to: {
      number: transfer.credited_account.account_number,
      agency: transfer.credited_account.agency,
      name: transfer.credited_account.user.user_info!.name,
      email: transfer.credited_account.user.user_info!.email,
      phone: transfer.credited_account.user.user_info!.phone,
    },
  });
}

/**
 * Executa uma transferência da conta do usuário logado para
 * uma outra conta.
 */
export async function postTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const transferRequest: TransferIn = res.locals.parsedBody;
  const debitedAccountId: string = res.locals.account.id;
  const accountTransactionalPasswordHash: string =
    res.locals.account.bcrypt_transaction_password;
  const passwordIsCorrect = await compare(
    transferRequest.transactional_password,
    accountTransactionalPasswordHash,
  );
  const loopTransfer =
    res.locals.account.account_number === transferRequest.account_number_to;

  if (!passwordIsCorrect) {
    const newAccountStatus = await AccountModel.incrementAttempt(
      debitedAccountId,
    );

    if (newAccountStatus === AccountStatus.BLOCKED) {
      return next(
        new RubError(
          403,
          "Too many incorrect attempts, account is now blocked",
          "TOO_MANY_ATTEMPTS",
        ),
      );
    }

    return next(
      new RubError(
        403,
        "Inserted transactional password is not correct",
        "ACCOUNT_INCORRECT_TRANSACTIONAL_PASSWORD",
      ),
    );
  } else {
    await AccountModel.resetAttempts(debitedAccountId);
  }

  if (loopTransfer) {
    return next(
      new RubError(
        403,
        "An account can't make a transfer to itself",
        "LOOP_TRANSFER",
      ),
    );
  }

  try {
    const currentDay = DateTime.now().startOf("day");
    const dayOfTransfer = transferRequest.time_to_transfer
      ? DateTime.fromJSDate(transferRequest.time_to_transfer).startOf("day")
      : currentDay;

    const daysUntilTransfer = dayOfTransfer.diff(currentDay, "day");

    let generatedTransfer: Transfer;

    if (daysUntilTransfer.days > 0) {
      generatedTransfer = await AccountModel.scheduleTransfer(
        debitedAccountId,
        transferRequest.account_number_to,
        transferRequest.value,
        dayOfTransfer.toJSDate(),
      );
    } else if (daysUntilTransfer.days == 0) {
      generatedTransfer = await AccountModel.makeTransfer(
        debitedAccountId,
        transferRequest.account_number_to,
        transferRequest.value,
      );
    } else {
      throw new RubError(
        400,
        "Can't schedule a transfer in a past date",
        "TRANSFER-SCHEDULE-DATE-INVALID",
      );
    }

    const returnObj = {
      transfer_status: generatedTransfer.transfer_status,
      transfer_time:
        generatedTransfer.transfer_status === "DONE"
          ? generatedTransfer.updated_at
          : generatedTransfer.time_to_transfer,
      transfered_value: generatedTransfer.value,
    };

    res.status(201).json(returnObj);
  } catch (e) {
    return next(e);
  }
}
