import { users } from './User.js';
import { pgTable, uuid, varchar, timestamp, boolean, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


export const verificationTypeEnum = pgEnum('verification_type', ['email', 'password']);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id), // Foreign key to users
    token: varchar('token', { length: 64 }).notNull(),
    type: verificationTypeEnum('type').default('email'),
    isUsed: boolean('is_used').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [{
    userIdIdx: index('user_id_idx').on(table.userId),
    tokenIdx: index('token_idx').on(table.token),
    isUsedIdx: index('is_used_idx').on(table.isUsed),
  }]
);

export const verificationTokenRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));