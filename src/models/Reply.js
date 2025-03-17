import { relations } from 'drizzle-orm';
import { comments } from './Comment.js';
import { users } from './User.js';
import { pgTable, uuid, text, timestamp, index, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { replyLikes } from './replyLike.js';

export const replies = pgTable(
  'replies',
  {
    id: uuid('id').primaryKey(),
    commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
    content: text('content'),
    gifurl:jsonb('gifurl'),
    isEdited: boolean('is_edited').default(false),
    replyLikesCount: integer('reply_likes_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),

    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    commentIdIdx: index('comment_id_idx').on(table.commentId),
    authorIdIdx: index('author_id_idx').on(table.authorId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  }]
);

export const repliesRelations = relations(replies, ({ one }) => ({
  comment: one(comments, {
    fields: [replies.commentId],
    references: [comments.id],
  }),
  likes: many(replyLikes, {
    fields: [replies.id],
    references: [replyLikes.replyId],
  }),
  author: one(users, {
    fields: [replies.authorId],
    references: [users.id],
  }),
}));