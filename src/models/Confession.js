import { users } from './User.js';
import { colleges } from './College.js';
import { pgTable, uuid, text, varchar, timestamp, index, sql } from 'drizzle-orm/pg-core';

export const confessions = pgTable(
  'confessions',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id), // Foreign key to users (optional for anonymity)
    collegeId: uuid('college_id').references(() => colleges.id), // Foreign key to colleges
    content: text('content').notNull(),
    status: varchar('status', { enum: ['active', 'deleted'] }).default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    collegeIdIdx: index('college_id_idx').on(table.collegeId),
    userIdIdx: index('user_id_idx').on(table.userId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  }]
);