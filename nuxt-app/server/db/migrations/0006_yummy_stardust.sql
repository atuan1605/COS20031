CREATE TYPE "public"."warehouse_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"status" "warehouse_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inactive_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "tracking_items" ADD COLUMN "warehouse_id" text;--> statement-breakpoint
ALTER TABLE "tracking_items" ADD CONSTRAINT "tracking_items_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;