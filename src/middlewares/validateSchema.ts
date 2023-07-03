import { NextFunction, Request, Response } from "express";
import { RSchemaError } from "handlers/errors/RubError";
import { SafeParseReturnType, ZodTypeAny } from "zod";

type schemaOrigin = "BODY" | "QUERY" | "PARAMS";

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
    switch (origin) {
      case "BODY":
        reqParse = schema.safeParse(req.body);
        break;
      case "QUERY":
        reqParse = schema.safeParse(req.query);
        break;
      case "PARAMS":
        reqParse = schema.safeParse(req.params);
        break;
    }

    if (!reqParse.success) {
      return next(new RSchemaError(reqParse.error));
    }

    switch (origin) {
      case "BODY":
        res.locals.parsedBody = reqParse.data;
        break;
      case "QUERY":
        res.locals.parsedQuery = reqParse.data;
        break;
      case "PARAMS":
        res.locals.parsedParams = reqParse.data;
        break;
    }

    next();
  };
}
