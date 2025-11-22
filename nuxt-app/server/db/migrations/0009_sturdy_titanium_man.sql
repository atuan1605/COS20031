CREATE TABLE "boxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	CONSTRAINT "boxes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "tracking_items" ADD COLUMN "box_id" uuid;--> statement-breakpoint
ALTER TABLE "tracking_items" ADD CONSTRAINT "tracking_items_box_id_boxes_id_fk" FOREIGN KEY ("box_id") REFERENCES "public"."boxes"("id") ON DELETE no action ON UPDATE no action;