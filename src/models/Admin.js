
import { pgTable, uuid, varchar, boolean, timestamp, index, sql } from 'drizzle-orm/pg-core';

export const admins = pgTable(
  'admins',
  {
    id: uuid('id').primaryKey().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: varchar('role', { enum: ['admin'] }).default('admin'),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    emailIdx: index('email_idx').on(table.email),
  }]
);