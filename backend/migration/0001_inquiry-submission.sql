CREATE TYPE "public"."inquiry_priority" AS ENUM('LOW', 'NORMAL', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "inquiries_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"customer_id" uuid NOT NULL,
	"subject" varchar(150) NOT NULL,
	"description" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'NEW' NOT NULL,
	"priority" "inquiry_priority" DEFAULT 'NORMAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiries_number_unique" UNIQUE("number")
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiries_customer_created_index" ON "inquiries" USING btree ("customer_id","created_at");