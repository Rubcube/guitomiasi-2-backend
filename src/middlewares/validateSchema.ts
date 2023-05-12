import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export function validateSchema(schema: ZodTypeAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const reqParse = schema.safeParse(req.body);

    if (!reqParse.success) {
      return res.status(422).json({
        reason: "Failed to validate schema",
        error: reqParse.error,
      });
    }

    res.locals.parsedBody = reqParse.data;
    next();
  };
}
