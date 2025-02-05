import { pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { replies } from "./Reply.js";
import { users } from "./User.js";
import { relations } from "drizzle-orm";

export const replyLikes = pgTable(
  "reply_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    replyId: uuid("reply_id").references(() => replies.id, { onDelete: 'cascade' }),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow(),

  },
  (table) => [
    {
      replyIdIdx: index("reply_id_idx").on(table.replyId),
      userIdIdx: index("user_id_idx").on(table.userId),
    },
  ]
);

export const replyLikesRelations = relations(replyLikes, ({ one }) => ({
  reply: one(replies, {
    fields: [replyLikes.replyId],
    references: [replies.id],
  }),
  user: one(users, {
    fields: [replyLikes.userId],
    references: [users.id],
  }),
}));
