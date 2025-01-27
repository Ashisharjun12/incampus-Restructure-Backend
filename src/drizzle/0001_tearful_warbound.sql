ALTER TABLE "admins" ALTER COLUMN "name" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "email" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "password" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "refresh_token" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "name" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "location" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE varchar(20);