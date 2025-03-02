import { users } from './User.js';
import { colleges } from './College.js';
import { pgTable, uuid, text, timestamp, index,integer,boolean,jsonb,serial} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';



export const confessionRoom =  pgTable('confession_room',{
  id:uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').references(() => colleges.id, { onDelete: 'cascade' }),
  membersCount: integer('members_count').default(0),
  confessionMessages:jsonb('confession_messages')
})



export const confessions = pgTable(
  'confessions',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), 
    content: text('content').notNull(),
    isEdited: boolean('is_edited').default(false),
    confessionLikesCount: integer('confession_likes_count').default(0),
    confessionCommentsCount: integer('confession_comments_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [{
    userId: index('user_id_id').on(table.userId),
    createdAtId: index('created_at_id').on(table.createdAt),
  }]
);


export const confessionLikes =pgTable('confessions_likes',{
  id: uuid('id').primaryKey(),
  confessionId: uuid('confession_id').references(() => confessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const confessionComments = pgTable('confessions_comments',{
  id: uuid('id').primaryKey(),
  confessionId: uuid('confession_id').references(() => confessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})





export const confessionRelations = relations(confessions, ({ one ,many}) => ({
  user: one(users, {
    fields: [confessions.userId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [confessions.collegeId],
    references: [colleges.id],
  }),
  confessionLikes: many(confessionLikes, {
    fields: [confessionLikes.confessionId],
    references: [confessions.id],
  }),
  confessionComments: many(confessionComments, {
    fields: [confessionComments.confessionId],
    references: [confessions.id],
  }),
}));