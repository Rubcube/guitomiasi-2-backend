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

export class RInternalError extends RubError {
  constructor() {
    super(500, "An internal error ocurred", "INTERNAL_ERROR");
  }
}
