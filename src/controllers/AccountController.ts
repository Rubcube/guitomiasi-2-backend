import {
  Account,
  AccountStatus,
  Transfer,
  TransferStatus,
} from "@prisma/client";
import { compare, hash } from "bcrypt";
import { AccountPasswordPatch, VerifyAccountExistence } from "dtos/AccountDTO";
import { TransferIn, TransferOut } from "dtos/TransferDTO";
import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import { DateTime, Settings } from "luxon";
import * as AccountModel from "models/AccountModel";
import * as UserModel from "models/UserModel";
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
  const { status, direction, order, page, start, end }: TransferOut =
    res.locals.parsedQuery;
  let transfers;

  if (status === "DONE") {
    transfers = await AccountModel.getTransfers({
      accountID,
      direction,
      order,
      page,
      start,
      end,
    });
  } else {
    transfers = await AccountModel.getScheduledTransfers({
      accountID,
      order,
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
      new RubError(404, "Essa transferência não existe", "TRANSFER-NOT-FOUND"),
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
      new RubError(403, "Usuário não autorizado", "TRANSFER-FORBIDDEN-ACCESS"),
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
          "Devido ao excesso de tentativas incorretas de transferência, essa conta agora está bloqueada",
          "TOO_MANY_ATTEMPTS",
        ),
      );
    }

    return next(
      new RubError(
        403,
        "Senha transacional incorreta",
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
        "Não é possível realizar uma transferência para a conta remetente",
        "LOOP_TRANSFER",
      ),
    );
  }

  try {
    const currentDay = DateTime.now().startOf("day");
    const dayOfTransfer = transferRequest.time_to_transfer
      ? DateTime.fromJSDate(transferRequest.time_to_transfer)
          .setZone(Settings.defaultZone)
          .startOf("day")
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
        "Não é possível agendar uma transferência para um tempo passado",
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

/**
 * Endpoint para alterar a senha transacional a partir da anterior
 */
export async function patchPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accountId: string = res.locals.account.id;
  const accountTransactionalPasswordHash: string =
    res.locals.account.bcrypt_transaction_password;
  const { old_password, new_password }: AccountPasswordPatch =
    res.locals.parsedBody;

  const passwordIsCorrect = await compare(
    old_password,
    accountTransactionalPasswordHash,
  );

  if (passwordIsCorrect) {
    const newPasswordHash = await hash(new_password, 10);

    await AccountModel.patchPassword(accountId, newPasswordHash);
    return res.status(201).json({
      message: "Transactional password changed successfully",
    });
  } else {
    return next(
      new RubError(400, "Não foi possível alterar senha transacional"),
    );
  }
}

export async function getAssociatedUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { accountNumber }: VerifyAccountExistence = res.locals.parsedParams;

  const account = await AccountModel.getAccountByNumber(accountNumber, false);

  if (!account) {
    return next(new RubError(404, "Conta não encontrada", "ACCOUNT-NOT-FOUND"));
  }

  if (account.account_status !== AccountStatus.ACTIVE) {
    return next(
      new RubError(403, "Conta destino não está ativa", "ACCOUNT-NOT-ACTIVE"),
    );
  }

  const { user } = await UserModel.getUserInfo(account.owner_id);

  return res.status(200).json({
    name: user.name,
    agency: account.agency,
    account_number: account.account_number,
  });
}

export async function getUserAccounts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userID: string = res.locals.parsedJWTToken.id;

  const accounts = await AccountModel.getAccounts(userID);

  if (!accounts) {
    return next(
      new RubError(
        404,
        "Contas de usuário não encontradas",
        "USER-NO-ACCOUNT-FOUND",
      ),
    );
  }

  return res.status(200).json(accounts);
}
