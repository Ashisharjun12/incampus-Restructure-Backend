import { admins } from './Admin.js';
import { pgTable, uuid, varchar, boolean, timestamp, index, sql } from 'drizzle-orm/pg-core';

export const colleges = pgTable(
  'colleges',
  {
    id: uuid('id').primaryKey().unique(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    createdById: uuid('created_by_id').references(() => admins.id), // Foreign key to admins
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    nameIdx: index('name_idx').on(table.name),
    createdByIdIdx: index('created_by_id_idx').on(table.createdById),
  }]
);