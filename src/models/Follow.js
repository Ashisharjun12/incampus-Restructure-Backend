import { users } from './User.js';
import { pgTable, uuid, timestamp,primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id')
      .references(() => users.id)
      .notNull(),
    followeeId: uuid('followee_id')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    pk: primaryKey(table.followerId, table.followeeId), // Composite primary key
  }]
);

export const followRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
  }),
}));