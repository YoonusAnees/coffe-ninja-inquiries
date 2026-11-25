ALTER TYPE "public"."notification_type" ADD VALUE 'CUSTOMER_REPLIED';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "message_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;