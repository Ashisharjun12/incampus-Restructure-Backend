CREATE TYPE "public"."status" AS ENUM('active', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'gif');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other', 'preferNotToSay');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('email', 'password');--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" uuid,
	"type" "media_type" NOT NULL,
	"url" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "confessions" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "direct_messages" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "visibility" SET DATA TYPE visibility;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "gender" SET DATA TYPE gender;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "gender" SET DEFAULT 'preferNotToSay';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "type" SET DATA TYPE verification_type;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "media_id" uuid;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "media";--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_id_unique" UNIQUE("id");