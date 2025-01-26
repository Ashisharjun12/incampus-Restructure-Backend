import { users } from './User.js';
import { pgTable, uuid, timestamp,primaryKey } from 'drizzle-orm/pg-core';

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