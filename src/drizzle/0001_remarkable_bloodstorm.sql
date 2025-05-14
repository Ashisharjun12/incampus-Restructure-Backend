ALTER TABLE "users" ADD COLUMN "password_reset_token" varchar(512);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token_expiry" timestamp;