import { Request, Response, NextFunction } from 'express';

export const authentication = (req: Request, res:Response, next: NextFunction) => {
  // autenticação
  const notValid = false;
  if(notValid){
    return res.status(401).send({'messsage': 'deu erro'});
  }

  next();
}