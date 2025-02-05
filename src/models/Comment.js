import { posts } from './Post.js';
import { users } from './User.js';
import { pgTable, uuid, text, timestamp, index, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { replies } from './Reply.js';
import { commentLikes } from './commentLike.js';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().unique(),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }), // Foreign key to posts
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }), // Foreign key to users
    content: text('content').notNull(),
    isEdited: boolean('is_edited').default(false),
    commentLikesCount: integer('comment_likes_count').default(0),
    commentRepliesCount: integer('comment_replies_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    postIdIdx: index('post_id_idx').on(table.postId),
    authorIdIdx: index('author_id_idx').on(table.authorId),
  }]
);



export const commentRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  likes: many(commentLikes, { 
    fields: [comments.id],
    references: [commentLikes.commentId],
  
  }),
  replies: many(replies, {
    fields: [comments.id],
    references: [replies.commentId],
  }),
}));