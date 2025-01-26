import { pgTable, uuid, text, varchar, jsonb, timestamp, index,boolean} from 'drizzle-orm/pg-core';
import { users } from './User.js';

export const posts = pgTable(
    'posts',
    {
      id: uuid('id').primaryKey(),
      authorId: uuid('author_id').references(() => users.id), // Foreign key to users
      content: text('content'),
      media: jsonb('media').$type<Array<{ type: 'image' | 'gif', url: string, id: string }>>([]),
      visibility: varchar('visibility', { enum: ['public', 'private' ] }).default('public'),
      isEdited: boolean('is_edited').default(false),
      status: varchar('status', { enum: ['active', 'deleted'] }).default('active'),
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
