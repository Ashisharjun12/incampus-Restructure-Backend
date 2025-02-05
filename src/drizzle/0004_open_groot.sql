ALTER TABLE "colleges" DROP CONSTRAINT "colleges_created_by_id_admins_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "confessions" DROP CONSTRAINT "confessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "confessions" DROP CONSTRAINT "confessions_college_id_colleges_id_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_followee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "replies" DROP CONSTRAINT "replies_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "replies" DROP CONSTRAINT "replies_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reply_likes" DROP CONSTRAINT "reply_likes_reply_id_replies_id_fk";
--> statement-breakpoint
ALTER TABLE "reply_likes" DROP CONSTRAINT "reply_likes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_posts" DROP CONSTRAINT "saved_posts_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_posts" DROP CONSTRAINT "saved_posts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_college_id_colleges_id_fk";
--> statement-breakpoint
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_created_by_id_admins_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confessions" ADD CONSTRAINT "confessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confessions" ADD CONSTRAINT "confessions_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followee_id_users_id_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reply_likes" ADD CONSTRAINT "reply_likes_reply_id_replies_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."replies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reply_likes" ADD CONSTRAINT "reply_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;