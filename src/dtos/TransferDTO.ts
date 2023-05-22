import { DateTime } from "luxon";
import { z } from "zod";
import {
  accountNumber,
  monetaryValue,
  transactionPassword,
} from "zodTypes/account";
import { parsedDate } from "zodTypes/index";

export const TransferInSchema = z.object({
  account_number_to: accountNumber,
  value: monetaryValue,
  transactional_password: transactionPassword,
  time_to_transfer: parsedDate.optional(),
});

export const TransferOutSchema = z
  .object({
    direction: z.enum(["IN", "OUT"]).optional(),
    page: z.coerce.number().gte(0).optional(),
    start: parsedDate.optional(),
    end: parsedDate.optional(),
  })
  .superRefine((obj, ctx) => {
    if (obj.start && obj.end) {
      const startDate = DateTime.fromJSDate(obj.start);
      const endDate = DateTime.fromJSDate(obj.end);
      const delta = endDate.diff(startDate, "day").days;

      if (delta >= 0) {
        return obj;
      } else {
        ctx.addIssue({
          code: "custom",
          path: ["start", "end"],
        });

        return z.NEVER;
      }
    }
  });

export type TransferIn = z.infer<typeof TransferInSchema>;
export type TransferOut = z.infer<typeof TransferOutSchema>;
