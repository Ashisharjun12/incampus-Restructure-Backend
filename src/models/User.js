import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { colleges } from './College.js';
import { posts } from './Post.js';
import { likes } from './Like.js';
import { comments } from './Comment.js';
import { savedPosts } from './SavedPost.js';
import { directMessages } from './PersonalDms.js';
import { follows } from './Follow.js';

const GenderEnum = pgEnum('gender', ['male', 'female', 'other', 'preferNotToSay']);
const StatusEnum = pgEnum('status', ['active', 'suspended', 'banned']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 30 }).unique(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    verifiedBadge: boolean('verified_badge').default(false),
    password: varchar('password', { length: 100 }).notNull(),
    avatar: text('avatar'),
    gender: GenderEnum('gender').default('preferNotToSay'),
    age: integer('age'),
    bio: text('bio').default('Place your bio here'),
    role: varchar('role', { length: 12 }).notNull().default('user'),
    collegeId: uuid('college_id').references(() => colleges.id),
    isVerified: boolean('is_verified').default(false),
    refreshToken: varchar('refresh_token', { length: 512 }),
    refreshTokenExpiry: timestamp('refresh_token_expiry'),
    lastActive: timestamp('last_active').defaultNow(),
    status: StatusEnum('status').default('active'),
    isTemporary: boolean('is_temporary').default(false),
    allowDMs: boolean('allow_dms').default(true),
    followerCount: integer('follower_count').default(0), // Number of followers
    followingCount: integer('following_count').default(0), // Number of users being followed
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    {
      usernameIdx: index('username_idx').on(table.username),
      emailIdx: index('email_idx').on(table.email),
      collegeIdIdx: index('college_id_idx').on(table.collegeId),
      createdAtIdx: index('created_at_idx').on(table.createdAt),
    }
  ]
);

export const userRelations = relations(users, ({ many, one }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
    
  }),
  posts: many(posts, {
    fields: [users.id],
    references: [posts.userId],
   
  }),
  likes: many(likes, {
    fields: [users.id],
    references: [likes.userId],
    
  }),
  comments: many(comments, {
    fields: [users.id],
    references: [comments.userId],
    
  }),
  savedPosts: many(savedPosts, {
    fields: [users.id],
    references: [savedPosts.userId],
    
  }),
  directMessages: many(directMessages, {
    fields: [users.id],
    references: [directMessages.userId],
    
  }),
  followers: many(follows, {
    fields: [users.id], // Local field in users table
    references: [follows.followeeId], // Foreign key in follows table
    relationName: 'follower', // Relation name for followers
  }),
  following: many(follows, {
    fields: [users.id], // Local field in users table
    references: [follows.followerId], // Foreign key in follows table
    relationName: 'followee', // Relation name for following
  }),
}));