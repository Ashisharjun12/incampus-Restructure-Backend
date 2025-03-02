import { admins } from './Admin.js';
import { pgTable, uuid, varchar, boolean, timestamp, index, jsonb} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { confessionRoom } from './Confession.js';

export const colleges = pgTable(
  'colleges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).unique().notNull(),
    logo: jsonb('logo'),
    location: varchar('location', { length: 50 }).notNull(),
    createdById: uuid('created_by_id').references(() => admins.id, { onDelete: 'cascade' }), 
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    nameIdx: index('name_idx').on(table.name),
    createdByIdIdx: index('created_by_id_idx').on(table.createdById),
  }]
);

export const collegeRelations = relations(colleges, ({ one }) => ({
  admin: one(admins, {
    fields: [colleges.createdById],
    references: [admins.id],
  }),
  confessionRoom:one(confessionRoom , ({one})=>({
    fields: [colleges.id],
    references: [confessionRoom.collegeId],
  }))
}));