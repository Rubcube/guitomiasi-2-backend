import { UserStatus } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { Patch } from "dtos";
import { OnboardingUserStepValidation } from "dtos/OnboardingDTO";
import { UserPasswordPatch } from "dtos/UsersDTO";
import { NextFunction, Request, Response } from "express";
import { createFieldError, FieldError } from "handlers/errors/FieldError";
import { RubError } from "handlers/errors/RubError";
import * as UserModel from "models/UserModel";
import { parseJWT } from "services/jwt";
import { mailerTransport, sendResetPasswordMail } from "services/mail";
import { Omitter } from "utils/index";
import { userDocument } from "zodTypes/user";

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
    return res.status(200).send("Email verificado com sucesso!");
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
  const userEmail: string = res.locals.parsedJWTToken.email;
  const patchData: UserPasswordPatch = res.locals.parsedBody;
  const hashed: boolean | undefined = res.locals.hashed;

  try {
    let allow: boolean;
    const userAuth = await UserModel.getAuth({ id: userId });
    const hashInDatabase = userAuth!.bcrypt_user_password;
    if (hashed) {
      const oldPasswordHash = res.locals.parsedJWTToken.old_password;
      allow = oldPasswordHash == hashInDatabase;
    } else {
      allow = await compare(patchData.old_password, hashInDatabase);
    }

    if (allow) {
      const newHash = await hash(patchData.new_password, 10);
      await UserModel.updateUserPassword({ id: userId }, newHash);

      mailerTransport.sendMail({
        from: "noreply@rubbank.com",
        to: userEmail,
        subject: "Password changed!",
        text: "Your password was changed.",
      });

      return res.status(201).json({
        message: "Password was changed successfully!",
      });
    } else {
      throw new RubError(
        400,
        "Não foi possível resetar senha",
        "PASSWORD-RESET-ERROR",
      );
    }
  } catch (e) {
    next(e);
  }
}

/**
 * Endpoint para enviar um email para usuário que esqueceu sua senha.
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const document = userDocument.safeParse(req.params.document);

  if (!document.success) {
    return next(
      new RubError(400, "Documento inserido (CPF, CNPJ) não é válido"),
    );
  }

  const auth = await UserModel.getAuth({ document: document.data });

  if (!auth) {
    return next(
      new RubError(400, "Não foi possível requisitar alteração de senha"),
    );
  }

  if (
    auth.user_status === UserStatus.NOT_VERIFIED ||
    auth.user_status === UserStatus.INACTIVE
  ) {
    return next(
      new RubError(
        403,
        "Conta de usuário precisa estar ativa para realizar alteração de senha",
        "PASSWORD_RESET-USER_STATUS_INVALID",
      ),
    );
  }

  sendResetPasswordMail(
    auth.id,
    auth.user_info!.email,
    auth.bcrypt_user_password,
  );

  return res
    .status(200)
    .send("An email was sent with the steps to reset your password.");
}

/**
 * Endpoint para atribuir uma nova senha para um determinado usuário.
 * Será utilizado um JWT enviado para o email do usuário para atestar
 * que o mesmo é quem está atualizando sua própria senha.
 */
export async function appendNewPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const jwt = parseJWT<{ id: string; email: string; old_password: string }>(
      req.params.jwt,
    );
    const old_password = jwt.old_password;

    res.locals.parsedJWTToken = jwt;
    res.locals.parsedBody.old_password = old_password;
    res.locals.hashed = true;

    next();
  } catch (e) {
    next(e);
  }
}

/**
 * Endpoint para validar os dados de um usuário que está se cadastrando.
s */
export async function validateUserOnboardingData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userData: OnboardingUserStepValidation = res.locals.parsedBody;

  const emailAvailable = await UserModel.isEmailAvailable(userData.email);
  const documentAvailable = await UserModel.isDocumentAvailable(
    userData.document,
  );
  const phoneAvailable = await UserModel.isPhoneAvailable(userData.phone);

  if (!emailAvailable || !documentAvailable || !phoneAvailable) {
    const schemaErrors: FieldError[] = [];

    if (!emailAvailable) {
      schemaErrors.push(createFieldError(["email"], "DUPLICATE"));
    }

    if (!documentAvailable) {
      schemaErrors.push(createFieldError(["document"], "DUPLICATE"));
    }

    if (!phoneAvailable) {
      schemaErrors.push(createFieldError(["phone"], "DUPLICATE"));
    }

    return res.status(400).json({ schemaErrors });
  }

  return res.status(200).json({
    message: "Dados validados com sucesso!",
  });
}
