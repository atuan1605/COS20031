CREATE TYPE "public"."returned_items_status_enum" AS ENUM('none', 'returnedAtWarehouse', 'customerReturn', 'continue');--> statement-breakpoint

CREATE TABLE tracking_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  returned_at TIMESTAMP WITH TIME ZONE,
  returned_status returned_items_status_enum DEFAULT NULL,
  tracking_number TEXT UNIQUE NOT NULL,
  file TEXT,
  weight DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  received_at_warehouse_at TIMESTAMP WITH TIME ZONE,
  packing_at TIMESTAMP WITH TIME ZONE,
  boxed_at TIMESTAMP WITH TIME ZONE,
  delivering_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_fragile_item BOOLEAN DEFAULT FALSE
);
