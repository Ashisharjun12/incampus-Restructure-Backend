ALTER TABLE "posts" ADD COLUMN "likes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "comments_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "likes" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "comments" jsonb DEFAULT '[]'::jsonb;