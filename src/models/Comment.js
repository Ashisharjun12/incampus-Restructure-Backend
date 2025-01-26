import { posts } from './Post.js';
import { users } from './User.js';
import { pgTable, uuid, text, timestamp, index, sql } from 'drizzle-orm/pg-core';

export const comments = pgTable(
    'comments',
    {
      id: uuid('id').primaryKey(),
      postId: uuid('post_id').references(() => posts.id), // Foreign key to posts
      authorId: uuid('author_id').references(() => users.id), // Foreign key to users
      content: text('content').notNull(),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => [{
      postIdIdx: index('post_id_idx').on(table.postId),
      authorIdIdx: index('author_id_idx').on(table.authorId),
    }]
  );