import { Prisma, PrismaClient } from "@prisma/client";

export type PrismaTransactionalClient = Omit<
  PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectPerOperation | Prisma.RejectOnNotFound | undefined
  >,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;
