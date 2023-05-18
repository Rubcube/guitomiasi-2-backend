import { DateTime } from "luxon";
import { z } from "zod";

export const bcryptHash = z.string().length(60);
export const parsedDate = z.string().transform((date, ctx) => {
  const res = DateTime.fromISO(date);

  if (!res.isValid) {
    ctx.addIssue({
      code: "invalid_date",
      message: "DATE-INVALID-FORMAT",
    });
    return z.NEVER;
  } else {
    return res.toJSDate();
  }
});
export const numericString = (errorMsg: string) =>
  z.string().regex(/^\d*$/, errorMsg);
export const uuidFormat = z.string().uuid("UUID-INVALID-FORMAT");
