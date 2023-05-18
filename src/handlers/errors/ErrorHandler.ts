import { Response } from "express";
import { RubError } from "./RubError";

export function handleError(err: Error, res: Response) {
  if (err instanceof RubError) {
    const { message, httpCode: statusCode, ...errorInfo } = err;
    res.status(err.httpCode).json({
      message: err.message,
      ...errorInfo,
    });
  } else {
    res.status(500).json({
      message: err.message,
    });
  }
}
