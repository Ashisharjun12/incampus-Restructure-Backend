import { pgTable, uuid, text, varchar, jsonb, timestamp, index,boolean, pgEnum, serial} from 'drizzle-orm/pg-core';
import { users } from './User.js';
import { relations } from 'drizzle-orm';

export const visibilityEnum = pgEnum('visibility', ['public', 'private']);
export const statusEnum = pgEnum('status', ['active', 'deleted']);

export const mediaTypeEnum = pgEnum('media_type', ['image', 'gif']);
export const mediaTable = pgTable('media', {
    id: serial('id').primaryKey(),
    postId: uuid('post_id').references(() => posts.id), // Foreign key to posts
    type: mediaTypeEnum('type').notNull(),
    url: varchar('url', { length: 100 }).notNull()
  });

export const posts = pgTable(
    'posts',
    {
      id: uuid('id').primaryKey(),
      authorId: uuid('author_id').references(() => users.id), // Foreign key to users
      content: text('content'),
      mediaId: uuid('media_id').references(() => mediaTable.id), // Foreign key to media
      visibility: visibilityEnum('visibility').default('public'),
      isEdited: boolean('is_edited').default(false),
      status: statusEnum('status').default('active'),
      isSaved: boolean('is_saved').default(false),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => [{
      authorIdIdx: index('author_id_idx').on(table.authorId),
      createdAtIdx: index('created_at_idx').on(table.createdAt),
      visibilityIdx: index('visibility_idx').on(table.visibility),
    }]
  );

  export const postRelations = relations(posts, ({ one }) => ({
    author: one(users, {
      fields: [posts.authorId],
      references: [users.id],
    }),
    media: one(mediaTable, {
      fields: [posts.mediaId],
      references: [mediaTable.id],
    }),
  }));


  export const mediaRelations = relations(mediaTable, ({ one }) => ({
    post: one(posts, {
      fields: [mediaTable.postId],
      references: [posts.id],
    }),
  }));


