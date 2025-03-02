ALTER TABLE "confession_room" DROP CONSTRAINT "confession_room_college_id_colleges_id_fk";
--> statement-breakpoint
ALTER TABLE "confession_room" ADD CONSTRAINT "confession_room_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;