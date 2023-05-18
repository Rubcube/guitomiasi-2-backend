import { Request, Response, NextFunction } from "express";
import { RubError } from "handlers/ErrorHandler";
import { SafeParseReturnType, ZodIssueCode, ZodTypeAny } from "zod";

type schemaOrigin = "BODY" | "QUERY";

export function validateSchema(
  schema: ZodTypeAny,
  origin: schemaOrigin = "BODY",
) {
  return function (req: Request, res: Response, next: NextFunction) {
    let reqParse: SafeParseReturnType<any, any>;
    if (origin === "BODY") {
      reqParse = schema.safeParse(req.body);
    } else {
      reqParse = schema.safeParse(req.query);
    }

    if (!reqParse.success) {
      throw new RubError(422, "Failed to validate request schema", reqParse.error);
    }

    if (origin === "BODY") {
      res.locals.parsedBody = reqParse.data;
    } else {
      res.locals.parsedQuery = reqParse.data;
    }
    next();
  };
}
