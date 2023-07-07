import { UserStatus } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { compare, hash } from "bcrypt";
import { Patch } from "dtos";
import { OnboardingUserStepValidation } from "dtos/OnboardingDTO";
import { UserNewPassword, UserPasswordPatch } from "dtos/UsersDTO";
import { NextFunction, Request, Response } from "express";
import { createFieldError, FieldError } from "handlers/errors/FieldError";
import {
  INTERNAL_ERROR,
  RPrismaError,
  RubError,
} from "handlers/errors/RubError";
import * as UserModel from "models/UserModel";
import path from "path";
import RandExp from "randexp";
import { parseJWT } from "services/jwt";
import { mailerTransport, sendResetPasswordMail } from "services/mail";
import { AuthenticatedResponseL, ResponseL } from "types/index";
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
    return res.sendFile(
      path.resolve(__dirname, "..", "templates", "accountVerified.handlebars"),
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
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
  _res: Response,
  next: NextFunction,
) {
  const res = _res as AuthenticatedResponseL<UserPasswordPatch>;
  const userId: string = res.locals.parsedJWTToken.id;
  const userEmail: string = res.locals.parsedJWTToken.email;
  const patchData: UserPasswordPatch = res.locals.parsedBody;

  try {
    const userAuth = await UserModel.getAuth({ id: userId });
    const hashInDatabase = userAuth!.bcrypt_user_password;
    const isPasswordEqual = await compare(
      patchData.old_password,
      hashInDatabase,
    );

    if (isPasswordEqual) {
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
  res: Response = {} as ResponseL<{ document: string }>,
  next: NextFunction,
) {
  const { document } = res.locals.parsedBody;

  const auth = await UserModel.getAuth({ document });

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

  const generatedToken = new RandExp(/^[a-zA-Z0-9@#$%^&+=]{12}$/).gen();
  try {
    await UserModel.createPasswordResetAttempt(auth.id, generatedToken);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return next(new RPrismaError(e));
    } else {
      return next(INTERNAL_ERROR);
    }
  }
  sendResetPasswordMail(auth.user_info!.email, generatedToken);

  return res
    .status(200)
    .send("An email was sent with the steps to reset your password.");
}

/**
 * Endpoint para, a partir de um documento e um token, resetar a senha de um usuário.
 * @throws `400` Caso:
 * - O token não seja válido
 * - O token já tenha sido utilizado
 * - O usuário não exista
 * @throws `500` Erro interno
 */
export async function resetPassword(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const res = _res as ResponseL<UserNewPassword>;
  const { document, new_password, token } = res.locals.parsedBody;
  const error = new RubError(
    400,
    "Não foi possível resetar senha, verifique se o token inserido é válido.",
  );

  try {
    const associatedUser = await UserModel.getAuth({ document });

    if (!associatedUser) {
      return next(error);
    }

    const entry = await UserModel.getPasswordResetAttempt(
      associatedUser.id,
      token,
    );

    if (!entry || (entry && entry.used)) {
      return next(error);
    }

    const newHash = await hash(new_password, 10);
    await UserModel.updateUserPassword({ id: associatedUser.id }, newHash);

    // Atualizando o token para que ele não possa ser utilizado novamente
    await UserModel.markPasswordResetAttemptAsUsed(associatedUser.id, token);

    return res.status(201).json({
      message: "Password was changed successfully!",
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return next(new RPrismaError(e));
    } else {
      return next(INTERNAL_ERROR);
    }
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

    return res.status(422).json({ schemaErrors });
  }

  return res.status(200).json({
    message: "Dados validados com sucesso!",
  });
}
