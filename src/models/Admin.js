import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';



export const admins = pgTable(
  'admins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    password: varchar('password', { length: 100 }).notNull(),
    role: varchar("role", { length: 12 }).notNull().default("admin"),
    refreshToken: varchar('refresh_token', { length: 300 }),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    emailIdx: index('email_idx').on(table.email),
  }]
);

