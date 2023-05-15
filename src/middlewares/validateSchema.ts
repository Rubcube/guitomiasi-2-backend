import { Request, Response, NextFunction } from "express";
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
      const issueArray = reqParse.error.issues;
      const flatErrorArray: string[] = issueArray.map(issue => {
        let errorMessage = issue.message;
        const relevantCodes: ZodIssueCode[] = [
          ZodIssueCode.too_big,
          ZodIssueCode.too_small,
        ];
        if (relevantCodes.indexOf(issue.code) >= 0) {
          errorMessage += `: ${issue.code.toUpperCase()}`;
        }

        return errorMessage;
      });

      return res.status(422).json({
        error: flatErrorArray,
        message: "Request was rejected because the schema was not validated",
      });
    }

    if (origin === "BODY") {
      res.locals.parsedBody = reqParse.data;
    } else {
      res.locals.parsedQuery = reqParse.data;
    }
    next();
  };
}
