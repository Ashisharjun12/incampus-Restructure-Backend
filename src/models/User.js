import { colleges } from './College.js';
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, pgEnum} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { posts } from './Post.js';
import { likes } from './Like.js';
import { comments } from './Comment.js';
import { savedPosts } from './SavedPost.js';
import { directMessages } from './PersonalDms.js';


export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'preferNotToSay']);
export const statusEnum = pgEnum('status', ['active', 'suspended', 'banned']);

export const users = pgTable(
    'users',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      username: varchar('username', { length: 30 }).unique(),
      email: varchar('email', { length: 100 }).unique().notNull(),
      password: varchar('password', { length: 100 }).notNull(),
      avatar: text('avatar'),
      gender: genderEnum('gender').default('preferNotToSay'),
      age: integer('age'),
      role: varchar("role", { length: 12 }).notNull().default("user"),
      collegeId: uuid('college_id').references(() => colleges.id), // Foreign key to colleges
      isVerified: boolean('is_verified').default(false),
      refreshToken: varchar('refresh_token', { length: 512 }),
      refreshTokenExpiry: timestamp('refresh_token_expiry'),
      lastActive: timestamp('last_active').defaultNow(),
      status: statusEnum('status').default('active'),
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

  export const userRelations = relations(users, ({ one }) => ({
    college: one(colleges, {
      fields: [users.collegeId],
      references: [colleges.id],
    }),
    posts: many(posts),
    likes: many(likes),
    comments: many(comments),
    savedPosts: many(savedPosts),
    directMessages: many(directMessages),
  
  }));


