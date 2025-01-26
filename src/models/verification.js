import { users } from './User.js';
import { pgTable, uuid, varchar, timestamp, boolean, index, sql } from 'drizzle-orm/pg-core';


export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id), // Foreign key to users
    token: varchar('token', { length: 64 }).notNull(),
    type: varchar('type', { enum: ['email', 'password'] }).default('email'),
    isUsed: boolean('is_used').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [{
    userIdIdx: index('user_id_idx').on(table.userId),
    tokenIdx: index('token_idx').on(table.token),
    isUsedIdx: index('is_used_idx').on(table.isUsed),
  }]
);