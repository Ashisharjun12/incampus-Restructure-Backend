import { pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { comments } from "./Comment.js";
import { users } from "./User.js";
import { relations } from "drizzle-orm";

export const commentLikes = pgTable(
  "comment_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id").references(() => comments.id, { onDelete: 'cascade' }),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow(),

  },
  (table) => [
    {
      commentIdIdx: index("comment_id_idx").on(table.commentId),
      userIdIdx: index("user_id_idx").on(table.userId),
    },
  ]
);

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));
