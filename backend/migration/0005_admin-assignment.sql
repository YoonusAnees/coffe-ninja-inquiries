CREATE TYPE "public"."inquiry_message_visibility" AS ENUM('PUBLIC', 'INTERNAL');--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "visibility" SET DATA TYPE "public"."inquiry_message_visibility" USING "visibility"::text::"public"."inquiry_message_visibility";--> statement-breakpoint
CREATE INDEX "messages_inquiry_visibility_created_idx" ON "messages" USING btree ("inquiry_id","visibility","created_at","id");--> statement-breakpoint
DROP TYPE "public"."inquiry_messsage_visibility";