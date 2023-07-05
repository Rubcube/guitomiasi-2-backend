import { Response } from "express";

export interface AuthenticatedResponse extends Response {
  locals: {
    parsedJWTToken: {
      id: string;
      email: string;
    };
  };
}

export interface ResponseL<B = undefined, Q = undefined, P = undefined>
  extends Response {
  locals: {
    parsedBody: B;
    parsedQuery: Q;
    parsedParams: P;
  };
}

export type AuthenticatedResponseL<
  B = undefined,
  Q = undefined,
  P = undefined,
> = AuthenticatedResponse & ResponseL<B, Q, P>;
