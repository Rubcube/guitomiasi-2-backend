import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const fetchedToken = req.headers["x-access-token"];

  if (!fetchedToken) {
    return res.status(401).json("No JWT token was found");
  }

  const token = Array.isArray(fetchedToken) ? fetchedToken[0] : fetchedToken;

  verify(token, process.env.SECRET_JWT as string, (error, decodedToken) => {
    if (error) {
      return res.status(500).json("Failed to authenticate token");
    }

    if (typeof decodedToken === "string" || decodedToken === undefined) {
      return res.status(500).json("Failed to parse token");
    }

    res.locals.parsedJWTToken = decodedToken;
    next();
  });
};
