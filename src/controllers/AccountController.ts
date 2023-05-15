import { Request, Response } from "express";
import { getAccountAndUser, getAccountTransfers } from "models/AccountModel";
import { parsedDate } from "zodTypes/index";
import moment from "moment";
import { z } from "zod";
import { DateRange } from "dtos/DateDTO";

function checkDateRange(date: Date, startDate?: Date, endDate?: Date) {
  const dateMoment = moment(date);
  let dateIsValid = true;

  if (startDate) {
    dateIsValid = dateIsValid && dateMoment.isAfter(moment(startDate));
  }
  if (endDate) {
    dateIsValid = dateIsValid && dateMoment.isBefore(moment(endDate));
  }

  return dateIsValid;
}

export async function getAccountBalance(req: Request, res: Response) {
  const userID: string = res.locals.parsedJWTToken.id;
  const accountID: string = req.params.id;

  const account = await getAccountAndUser(accountID);

  return res.status(200).json({
    balance: account!.balance,
  });
}

export async function getAllTransfers(req: Request, res: Response) {
  const accountID = req.params.id;
  const { start, end }: DateRange = res.locals.parsedQuery;

  const transfers = await getAccountTransfers(accountID, start, end);

  return res.status(200).json(transfers);
}
