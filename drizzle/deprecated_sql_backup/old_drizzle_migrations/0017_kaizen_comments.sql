-- Migration: Create kaizen_comments table
-- This table stores comments on kaizen records

CREATE TABLE IF NOT EXISTS "kaizen_comments" (
    "id" text PRIMARY KEY NOT NULL,
    "kaizen_id" text NOT NULL,
    "user_id" text NOT NULL,
    "text" text NOT NULL,
    "created_at" timestamp NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "kaizen_comments_kaizen_id_idx" ON "kaizen_comments" USING btree ("kaizen_id");

CREATE INDEX IF NOT EXISTS "kaizen_comments_user_id_idx" ON "kaizen_comments" USING btree ("user_id");