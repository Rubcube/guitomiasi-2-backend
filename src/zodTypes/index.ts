import { z } from 'zod';

export const bcryptHash = z.string().length(60);
export const parsedDate = z.string().datetime().or(z.date()).transform(date => new Date(date));
export const numericString = (errorMsg: string) => z.string().regex(/\d*/, errorMsg);
