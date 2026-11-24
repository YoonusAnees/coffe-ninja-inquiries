CREATE TYPE "public"."inquiry_messsage_visibility" AS ENUM('PUBLIC', 'INTERNAL');--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"visibility" "inquiry_messsage_visibility" NOT NULL,
	"created_at" "cal::local_datetime" DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;