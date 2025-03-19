import { pgTable, uuid, text,  jsonb, timestamp, index, boolean, pgEnum, integer, serial, unique } from 'drizzle-orm/pg-core';
import { users } from './User.js';
import { relations } from 'drizzle-orm';
import { likes } from './Like.js';
import { comments } from './Comment.js';


const VisibilityEnum = pgEnum('visibility', ['public', 'private']);
const StatusEnum = pgEnum('status', ['active', 'deleted']);
const MediaTypeEnum = pgEnum('media_type', ['image', 'gif']);

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey(),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }), // Foreign key to users
    content: text('content'),
    mediaType: MediaTypeEnum('media_type').default('image'),
    media: jsonb('media'), 
    visibility: VisibilityEnum('visibility').default('public'),
    likesCount: integer('likes_count').default(0),
    commentsCount: integer('comments_count').default(0),
    isEdited: boolean('is_edited').default(false),
    status: StatusEnum('status').default('active'),
    savedPostCount: integer('saved_post_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [  
    {
      authorIdIdx: index('author_id_idx').on(table.authorId),
      createdAtIdx: index('created_at_idx').on(table.createdAt),
      visibilityIdx: index('visibility_idx').on(table.visibility),
    }
  ]
);


export const hashtags = pgTable('hashtags',{
  id:serial("id").primaryKey(),
  tag: text("tag").notNull().unique()
});

export const postHashtags = pgTable('post_hashtags', {
  id: serial("id").primaryKey(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  hashtagId: integer("hashtag_id").references(() => hashtags.id, { onDelete: "cascade" }),
},(table)=>[
  {
    uniquePostTag: unique().on(table.postId, table.hashtagId)
  }
  
])

export const hashtagRelations = relations(hashtags, ({ many }) => ({
  posts: many(postHashtags),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],

  }),
  likes: many(likes, {
    relationName: 'post_likes',
  }),
  comments: many(comments, {
    relationName: 'post_comments',
    }),
    hashtags:many(postHashtags)
}));