import { NextFunction, Request, Response } from "express";
import { RSchemaError } from "handlers/errors/RubError";
import { SafeParseReturnType, ZodTypeAny } from "zod";

type schemaOrigin = "BODY" | "QUERY";

/**
 * Gerador de *middleware* de validação de schema. Verifica se o *body* ou *query*
 * da requisição feita pode ser validado por um determinado schema definido
 * utilizando ZObject da biblioteca ZodJS. Caso não seja validado, interrompe
 * a requisição e retorna um erro 422.
 */
export function validateSchema(
  schema: ZodTypeAny,
  origin: schemaOrigin = "BODY",
) {
  return function (req: Request, res: Response, next: NextFunction) {
    let reqParse: SafeParseReturnType<unknown, unknown>;
    if (origin === "BODY") {
      reqParse = schema.safeParse(req.body);
    } else {
      reqParse = schema.safeParse(req.query);
    }

    if (!reqParse.success) {
      return next(new RSchemaError(reqParse.error));
    }

    if (origin === "BODY") {
      res.locals.parsedBody = reqParse.data;
    } else {
      res.locals.parsedQuery = reqParse.data;
    }
    next();
  };
}
