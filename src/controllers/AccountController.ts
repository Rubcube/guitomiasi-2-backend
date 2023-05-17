import { Request, Response } from "express";
import * as AccountModel from "models/AccountModel";
import moment from "moment";
import { DateRange } from "dtos/DateDTO";
import { Account, TransferStatus, UserAuth } from "@prisma/client";
import { TransferIn } from "dtos/TransferDTO";
import { compare } from "bcrypt";

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
  const { start, end }: DateRange = res.locals.parsedQuery;

  const transfers = await AccountModel.getTransfers(accountID, start, end);

  return res.status(200).json(transfers);
}

/**
 * Retorna informações detalhadas de uma determinada transferência.
 */
export async function getTransfer(req: Request, res: Response) {
  const transferId: string = req.params.transferId;

  const transfer = await AccountModel.getTransferDetail(transferId);

  if (!transfer) {
    return res.status(404).json({
      error: "TRANSFER-NOT-FOUND",
      message: "Transfer don't exist",
    });
  }

  // Retrieve ID from JWT
  const userId: string = res.locals.parsedJWTToken.id;
  // Fetch both sender and receiver accounts, check if user is related to one of them
  const senderAccount = await AccountModel.getAccount(transfer.account_id_from);
  const receiverAccount = await AccountModel.getAccount(transfer.account_id_to);

  const isSender = senderAccount!.user.id === userId;
  const isReceiver = receiverAccount!.user.id === userId;
  if (!isSender && !isReceiver) {
    return res.status(403).json({
      error: "TRANSFER-FORBIDDEN-ACCESS",
      message: "User is neither sender nor receiver",
    });
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
export async function postTransfer(req: Request, res: Response) {
  const transferRequest: TransferIn = res.locals.parsedBody;
  const debitedAccountId: string = res.locals.account.id;
  const accountTransactionalPasswordHash: string =
    res.locals.account.bcrypt_transaction_password;
  const passwordIsCorrect = await compare(
    transferRequest.transactional_password,
    accountTransactionalPasswordHash,
  );
  const loopbackTransfer =
    res.locals.account.account_number === transferRequest.account_number_to;

  if (!passwordIsCorrect) {
    return res.status(403).json({
      error: "ACCOUNT_INCORRECT_TRANSACTIONAL_PASSWORD",
      message: "Inserted transactional password is not correct",
    });
  }

  if (loopbackTransfer) {
    return res.status(403).json({
      error: "LOOP_TRANSFER",
      message: "An account can't make a transfer to itself",
    });
  }

  try {
    const transfer = await AccountModel.makeTransfer(
      debitedAccountId,
      transferRequest.account_number_to,
      transferRequest.value,
    );

    res.status(201).json({
      transfer_status: transfer.transfer_status,
      time_of_transfer: transfer.updated_at,
      transfered_value: transfer.value,
      message: "SUCCESS",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An internal error occurred",
    });
  }
}
