import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ZodError } from "zod";
import { FieldError, fromZodIssue } from "./FieldError";

export class RubError extends Error {
  readonly httpCode: number;
  readonly message: string;
  readonly errorCode?: string;

  constructor(httpCode: number, message: string, errorCode?: string) {
    super(message);
    this.httpCode = httpCode;
    this.message = message;
    this.errorCode = errorCode;
  }
}

export class RSchemaError extends RubError {
  readonly schemaErrors: FieldError[];

  constructor(zError: ZodError) {
    super(422, "Could not validate schema", "SCHEMA-INVALID");
    this.schemaErrors = zError.issues.map(fromZodIssue);
  }
}

export class RPrismaError extends RubError {
  constructor(pError: PrismaClientKnownRequestError) {
    let httpCode: number;
    let message: string;

    switch (pError.code) {
      case "P2002":
        const target: string[] = pError?.meta?.target as string[];
        const targetStr = target.join("-").toUpperCase();
        httpCode = 400;
        message = `Unique constraint failed: ${targetStr}`;
        break;
      default:
        httpCode = 500;
        message = `Prisma client internal error`;
        break;
    }

    super(httpCode, message);
  }
}

export const INTERNAL_ERROR = new RubError(
  500,
  "An internal error occurred",
  "INTERNAL_ERROR",
);
