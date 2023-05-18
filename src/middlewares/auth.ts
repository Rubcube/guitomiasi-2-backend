import { UserStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { RInternalError, RubError } from "handlers/errors/RubError";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { getUserStatus } from "models/UserModel";

export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fetchedToken = req.headers["authorization"];

  if (!fetchedToken) {
    return next(new RubError(401, "No JWT token was found", "AUTH-NO-TOKEN"));
  }

  try {
    const token = Array.isArray(fetchedToken) ? fetchedToken[0] : fetchedToken;
    const parsedToken = verify(token, process.env.SECRET_JWT as string);

    if (typeof parsedToken === "string") {
      return next(new Error("Unable to retrieve JWT payload"));
    }

    // Check for user status
    const userCurrentStatus = await getUserStatus(parsedToken.id);

    if (userCurrentStatus === UserStatus.ACTIVE) {
      res.locals.parsedJWTToken = parsedToken;
      next();
    } else {
      return next(
        new RubError(
          403,
          "User is not currently active",
          "AUTH-USER-NOT-ACTIVE",
        ),
      );
    }
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return next(
        new RubError(
          403,
          "User was not authorized because the JWT is expired",
          "AUTH-JWT-EXPIRED",
        ),
      );
    } else if (e instanceof JsonWebTokenError) {
      return next(
        new RubError(403, "JWT authentication failed", "AUTH-JWT-ERROR"),
      );
    } else {
      return next(new RInternalError());
    }
  }
}
