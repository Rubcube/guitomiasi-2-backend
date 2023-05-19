-- This is a manual migration
-- Add index to find scheduled transfer on `Transfer` table
CREATE INDEX "idx_scheduled_transfer" ON "Transfer"("transfer_status", "time_to_transfer")
WHERE "transfer_status" = 'SCHEDULED';
