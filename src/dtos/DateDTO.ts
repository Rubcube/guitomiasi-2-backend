import { z } from "zod";
import { parsedDate } from "zodTypes/index";

export const DateRangeSchema = z.object({
  start: parsedDate.optional(),
  end: parsedDate.optional(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;
