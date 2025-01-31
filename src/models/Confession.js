import { users } from './User.js';
import { colleges } from './College.js';
import { pgTable, uuid, text, timestamp, index, pgEnum ,integer,boolean} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const Status = pgEnum('status', ['active', 'deleted']);

export const confessions = pgTable(
  'confessions',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id), // Foreign key to users (optional for anonymity)
    collegeId: uuid('college_id').references(() => colleges.id), // Foreign key to colleges
    content: text('content').notNull(),
    isEdited: boolean('is_edited').default(false),
    confessionLikesCount: integer('confession_likes_count').default(0),
    confessionCommentsCount: integer('confession_comments_count').default(0),
    status: Status('status').default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    collegeIdIdx: index('college_id_idx').on(table.collegeId),
    userIdIdx: index('user_id_idx').on(table.userId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  }]
);

export const confessionRelations = relations(confessions, ({ one }) => ({
  user: one(users, {
    fields: [confessions.userId],
    references: [users.id],
  }),
}));