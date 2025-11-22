ALTER TABLE "payments" ADD COLUMN "received_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "delivering_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "success_at" timestamp with time zone;