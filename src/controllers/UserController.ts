import { compare, hash } from "bcrypt";
import { Patch, UserPasswordPatch } from "dtos/PatchDTO";
import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import * as UserModel from "models/UserModel";
import { parseJWT } from "services/jwt";
import { mailerTransport } from "services/mail";
import { Omitter } from "utils/index";

/**
 * Endpoint para verificar o email de um usuário, com base em um JWT enviado.
 */
export async function verifyUserEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const receivedJWT = req.params.jwt;

  // Tentando realizar o parse do JWT
  try {
    const parsedToken = parseJWT<{ email: string }>(receivedJWT);

    await UserModel.verifyUserEmail(parsedToken.email);
    return res.status(201).json({
      message: "User email verified successfully",
    });
  } catch (e) {
    next(e);
  }
}

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
  const { user: newUserInfo, address: newAddressInfo }: Patch =
    res.locals.parsedBody;

  try {
    const newUserRaw = await UserModel.patchUserInfo(userId, newUserInfo);
    const newUser = Omitter(newUserRaw, "created_at");

    const newAddressRaw = await UserModel.patchUserAddress(
      userId,
      newAddressInfo,
    );
    const newAddress = Omitter(newAddressRaw, "created_at");

    res.status(201).json({
      user: newUser,
      address: newAddress,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Endpoint utilizado para alterar uma senha de um usuário logado.
 */
export async function patchUserPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId: string = res.locals.parsedJWTToken.id;
  const patchData: UserPasswordPatch = res.locals.parsedBody;

  const userAuth = await UserModel.getAuth({ id: userId });
  const passwordIsCorrect = await compare(
    patchData.old_password,
    userAuth!.bcrypt_user_password,
  );

  try {
    if (passwordIsCorrect) {
      const newHash = await hash(patchData.new_password, 10);
      await UserModel.updateUserPassword({ id: userId }, newHash);

      mailerTransport.sendMail({
        from: "noreply@rubbank.com",
        to: userAuth?.user_info?.email,
        subject: "Password changed!",
        text: "Your password was changed.",
      });

      return res.status(201).json({
        message: "Password was changed successfully!",
      });
    } else {
      throw new RubError(
        400,
        "It was not possible to change password",
        "PASSWORD-RESET-ERROR",
      );
    }
  } catch (e) {
    next(e);
  }
}
