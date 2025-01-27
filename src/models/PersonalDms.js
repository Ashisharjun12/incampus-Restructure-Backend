import { users } from './User.js';
import { pgTable, uuid, text, boolean, varchar, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['active', 'deleted']);

export const directMessages = pgTable(
  'direct_messages',
  {
    id: uuid('id').primaryKey(),
    senderId: uuid('sender_id').references(() => users.id), // Foreign key to users (sender)
    receiverId: uuid('receiver_id').references(() => users.id), // Foreign key to users (receiver)
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false),
    status: statusEnum('status').default('active'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [{
    senderIdIdx: index('sender_id_idx').on(table.senderId),
    receiverIdIdx: index('receiver_id_idx').on(table.receiverId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  }]
);

export const directMessageRelations = relations(directMessages, ({ one }) => ({
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
  }),
}));

