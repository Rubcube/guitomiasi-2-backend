import { UserStatus } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { getUserStatus } from "models/UserModel";

export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fetchedToken = req.headers["authorization"];

  if (!fetchedToken) {
    return res.status(401).json({
      error: "AUTH-NO-TOKEN",
      message: "No JWT token was found",
    });
  }

  try {
    const token = Array.isArray(fetchedToken) ? fetchedToken[0] : fetchedToken;
    const parsedToken = verify(token, process.env.SECRET_JWT as string);

    if (typeof parsedToken === "string") {
      throw new Error("Unable to retrieve JWT payload");
    }

    // Check for user status
    const userCurrentStatus = await getUserStatus(parsedToken.id);

    if (userCurrentStatus === UserStatus.ACTIVE) {
      res.locals.parsedJWTToken = parsedToken;
      next();
    } else {
      return res.status(403).json({
        error: "AUTH-USER-NOT-ACTIVE",
        message: "User is not currently active",
        user_status: userCurrentStatus,
      });
    }
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return res.status(403).json({
        error: "AUTH-JWT-EXPIRED",
        message: "User was not authorized because the JWT is expired",
      });
    } else if (e instanceof JsonWebTokenError) {
      return res.status(403).json({
        error: "AUTH-JWT-ERROR",
      });
    } else {
      return res.status(500).json({
        error: "INTERNAL-ERROR",
      });
    }
  }
}
