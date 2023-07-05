/*
  Warnings:

  - A unique constraint covering the columns `[user_id,token]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_user_id_token_key" ON "PasswordReset"("user_id", "token");
