import { posts } from './Post.js';
import { users } from './User.js';
import { pgTable, uuid, timestamp, index} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const savedPosts = pgTable(
    'saved_posts',
    {
      id: uuid('id').primaryKey(),
      postId: uuid('post_id').references(() => posts.id), // Foreign key to posts
      userId: uuid('user_id').references(() => users.id), // Foreign key to users
      createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => [{
      postIdIdx: index('post_id_idx').on(table.postId),
      userIdIdx: index('user_id_idx').on(table.userId),
    }]
  );

  export const savedPostRelations = relations(savedPosts, ({ one }) => ({
    post: one(posts, {
      fields: [savedPosts.postId],
      references: [posts.id],
    }),
  }));