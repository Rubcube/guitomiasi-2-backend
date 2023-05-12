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
    return res.status(401).json("No JWT token was found");
  }

  const token = Array.isArray(fetchedToken) ? fetchedToken[0] : fetchedToken;
  const parsedToken = await verify(token, process.env.SECRET_JWT as string);

  if (typeof parsedToken === "string") {
    return res.status(500).json("Failed to authenticate token");
  }

  // Check for user status
  const userCurrentStatus = await getUserStatus(parsedToken.id);

  if (userCurrentStatus === UserStatus.ACTIVE) {
    res.locals.parsedJWTToken = parsedToken;
    next();
  } else {
    return res.status(403).send();
  }
}
