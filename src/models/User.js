import { colleges } from './College.js';
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, sql } from 'drizzle-orm/pg-core';


export const users = pgTable(
    'users',
    {
      id: uuid('id').primaryKey(),
      username: varchar('username', { length: 30 }).unique(),
      email: varchar('email', { length: 255 }).unique().notNull(),
      password: varchar('password', { length: 255 }).notNull(),
      avatar: text('avatar'),
      gender: varchar('gender', { enum: ['male', 'female', 'other', 'preferNotToSay'] }),
      age: integer('age'),
      collegeId: uuid('college_id').references(() => colleges.id), // Foreign key to colleges
      isVerified: boolean('is_verified').default(false),
      verificationToken: varchar('verification_token', { length: 64 }),
      verificationTokenExpiry: timestamp('verification_token_expiry'),
      lastActive: timestamp('last_active').defaultNow(),
      status: varchar('status', { enum: ['active', 'suspended', 'banned'] }).default('active'),
      isTemporary: boolean('is_temporary').default(false),
      allowDMs: boolean('allow_dms').default(true), // Allow users to control DMs
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => [{
      usernameIdx: index('username_idx').on(table.username),
      emailIdx: index('email_idx').on(table.email),
      collegeIdIdx: index('college_id_idx').on(table.collegeId),
      createdAtIdx: index('created_at_idx').on(table.createdAt),
    }]
  );