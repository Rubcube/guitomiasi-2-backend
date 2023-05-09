import { z } from 'zod';

export const transactionPassword = z.string().length(4).regex(/\d{4}/);