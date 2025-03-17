ALTER TABLE "comments" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "replies" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "gif_url" jsonb;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "gifurl";