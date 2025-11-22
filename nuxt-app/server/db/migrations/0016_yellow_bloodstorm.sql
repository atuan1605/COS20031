CREATE TYPE "public"."payment_status" AS ENUM('warehouse', 'customer');--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "status" "payment_status";