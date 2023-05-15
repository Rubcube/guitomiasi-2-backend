import { UserStatus } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { getUserStatus } from "models/UserModel";

export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fetchedToken = req.headers["x-access-token"];

  if (!fetchedToken) {
    return res.status(401).json({
      error: "AUTH-001",
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
        error: "AUTH-003",
        message: "User is not currently active",
        user_status: userCurrentStatus,
      });
    }
  } catch (e) {
    const err = e as Error;
    return res.status(500).json({
      error: "AUTH-002",
      message: "Failed to authenticate JWT token",
      jwt_message: err.message,
    });
  }
}
