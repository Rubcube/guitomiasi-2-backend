import { UserInfo } from "@prisma/client";
import { UserPatch } from "dtos/UsersDTO";
import { NextFunction, Request, Response } from "express";
import * as UserModel from "models/UserModel";

/**
 * Retorna informações do usuário logado.
 */
export async function getInfo(req: Request, res: Response, next: NextFunction) {
  const userId = res.locals.parsedJWTToken.id;
  const info = await UserModel.getUserInfo(userId);

  try {
    return res.status(200).json(info);
  } catch (e) {
    return next(e);
  }
}

/**
 * Realiza a atualização das informações do usuário logado.
 */
export async function patchInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId: string = res.locals.parsedJWTToken.id;
  const newInfo: UserPatch = res.locals.parsedBody;

  try {
    const newUserRaw = await UserModel.patchUserInfo(userId, newInfo);
    const { ...newUser }: Omit<UserInfo, "created_at"> = newUserRaw;
    res.status(201).json(newUser);
  } catch (e) {
    next(e);
  }
}
