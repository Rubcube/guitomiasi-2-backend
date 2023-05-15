import { z } from "zod";

export const bcryptHash = z.string().length(60);
export const parsedDate = z
  .string()
  .regex(
    /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/,
    "DATE-INVALID-FORMAT",
  )
  .or(z.date())
  .or(z.string().datetime())
  .transform(date => new Date(date));
export const numericString = (errorMsg: string) =>
  z.string().regex(/^\d*$/, errorMsg);
