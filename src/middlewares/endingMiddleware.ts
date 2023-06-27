import { Request, Response } from "express";

/**
 * *Middleware* que encerra a requisição.
 *
 * Utilizado em situações de validação de *schema*
 */
export async function endingMiddleware(req: Request, res: Response) {
  res.status(200).send();
}
