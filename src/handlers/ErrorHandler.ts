import { Response } from "express";
import { ZodError } from "zod";

type LengthError = {
  target: number,
  received: number,
}

type FieldError = {
  fieldName: string[],
  issue: "MISSING" | "FORMAT" | "LENGTH" | "VALUE",
  description: LengthError,
}

export default class RubError extends Error {
  readonly statusCode: number;
  readonly message: string;
  readonly schemaErrors?: FieldError[];

  constructor(statusCode: number, message: string, zodError?: ZodError<any>) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    if (zodError) {
      zodError.errors
    }
  }
}

export function handleError(err: RubError, res: Response) {
  res.status(err.statusCode).send(err.message);
}
