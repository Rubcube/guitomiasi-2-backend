import { Response, json } from "express";
import { ZodError } from "zod";

type PossibleFieldIssues = "MISSING" | "FORMAT" | "LENGTH" | "VALUE" | "UNKNOWN";

type FieldError = {
  fieldName: string[],
  issue: PossibleFieldIssues,
};


export class RubError extends Error {
  readonly statusCode: number;
  readonly message: string;
  readonly schemaErrors?: FieldError[];
  
  constructor(statusCode: number, message: string, zodError?: ZodError<any>) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    
    if (zodError) {
      this.schemaErrors = zodError.issues.map((zError) => {
        if (zError.code === "too_big" || zError.code === "too_small") {
          if (zError.type === "string") {
            return {
              fieldName: zError.path,
              issue: "LENGTH",
            } as FieldError;
          }
          
          if (zError.type === "number") {
            return {
              fieldName: zError.path,
              issue: "VALUE",
            } as FieldError;
          }
        }
        
        if (zError.code === "invalid_string") {
          return {
            fieldName: zError.path,
            issue: "FORMAT"
          } as FieldError;
        }
        
        if (zError.code === "invalid_type" && zError.received === "undefined") {
          return {
            fieldName: zError.path,
            issue: "MISSING",
          } as FieldError;
        }
        
        if (zError.code === "custom") {
          return {
            fieldName: zError.path,
            issue: "VALUE",
          } as FieldError;
        }
        
        return {
          fieldName: zError.path,
          issue: "UNKNOWN",
        } as FieldError;
      })
    }
  }
}

export const INTERNAL_ERROR = new RubError(500, "An internal error occurred");

export function handleError(err: RubError, res: Response) {
  const { message, statusCode, ...errorInfo } = err;
  res.status(err.statusCode).json({
    message: err.message,
    ...errorInfo,
  });
}
