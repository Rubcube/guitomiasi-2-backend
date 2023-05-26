import { Response } from "express";
import { RubError } from "./RubError";

/**
 * *Handler* de erros centralizados. É chamado toda vez que a função `next`
 * recebe como parâmetro uma instância da classe `Error`.
 */
export function handleError(err: Error, res: Response) {
  console.error(err.stack ? err.stack : `${err.name}: ${err.message}`);
  if (err instanceof RubError) {
    const { message, httpCode: statusCode, ...errorInfo } = err;
    res.status(statusCode).json({
      message: message,
      ...errorInfo,
    });
  } else {
    res.status(500).json({
      message: err.message,
    });
  }
}
