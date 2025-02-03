import logger from "../utils/logger.js";
import { db } from "../config/database.js";
import { users } from "../models/User.js";
import { posts } from "../models/Post.js";
import { comments } from "../models/Comment.js";
import { commentLikes } from "../models/commentLike.js";
import { likes } from "../models/Like.js";
import { eq, and, inArray } from "drizzle-orm";

export const likePost = async (req, res) => {
  try {
    logger.info("Liking post");
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if the post exists
    const findPost = await db.select().from(posts).where(eq(posts.id, postId));
    if (!findPost || findPost.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const findLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));

    if (findLike.length > 0) {
      return res.status(400).json({ message: "Post already liked" });
    }

    // Insert the like into the likes table
    await db.insert(likes).values({
      postId,
      userId,
    });

    // Increment the likesCount in the posts table
    const updatedPost = await db
      .update(posts)
      .set({
        likesCount: findPost[0].likesCount + 1,
      })
      .where(eq(posts.id, postId))
      .returning(); // Return the updated post

    return res.status(201).json({
      message: "Post liked",
      likesCount: updatedPost[0].likesCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unlikePost = async (req, res) => {
  try {
    logger.info("Unliking post");
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if the post exists
    const findPost = await db.select().from(posts).where(eq(posts.id, postId));
    if (!findPost || findPost.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has liked the post
    const findLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));

    if (findLike.length === 0) {
      return res.status(400).json({ message: "Post not liked by user" });
    }

    // Delete the like from the likes table
    await db
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));

    // Decrement the likesCount in the posts table
    const updatedPost = await db
      .update(posts)
      .set({
        likesCount: Math.max(0, findPost[0].likesCount - 1), // Prevent negative counts
      })
      .where(eq(posts.id, postId))
      .returning(); // Return the updated post

    return res.status(200).json({
      message: "Post unliked",
      likesCount: updatedPost[0].likesCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//fetch like for post
export const fetchLikeForPost = async (req, res) => {
  try {
    logger.info("Fetching like for post");
    const { postId } = req.params;

    // Check if the post exists
    const findPost = await db.select().from(posts).where(eq(posts.id, postId));
    if (!findPost || findPost.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch all likes for the post
    const findLikes = await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));

    // Fetch users who liked the post
    const userIds = findLikes.map((like) => like.userId);
    const findUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    return res.status(200).json({
      message: "Like fetched",
      likes: findLikes,
      users: findUsers,
      likesCount: findPost[0].likesCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// add like to comment

export const addLikeToComment = async (req, res) => {
  try {
    logger.info("Adding like to comment");
    const commentId = req.params.commentId;
    const userId = req.user.id;

    if (!commentId || !userId) {
      return res
        .status(400)
        .json({ message: "Comment id and user id are required" });
    }

    // Check if comment exists
    const findComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    if (!findComment || findComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user has already liked the comment
    const findLike = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        )
      );
    if (findLike && findLike.length > 0) {
      return res.status(400).json({ message: "Comment already liked" });
    }

    // Add like to comment
    await db.insert(commentLikes).values({
      commentId,
      userId,
    });

    // Increment the comment likes count in the comments table
    const updatedComment = await db
      .update(comments)
      .set({
        commentLikesCount: findComment[0].commentLikesCount + 1,
      })
      .where(eq(comments.id, commentId))
      .returning();

    return res.status(200).json({
      message: "Comment liked",
      commentLikesCount: updatedComment[0].commentLikesCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// remove like from comment

export const removeLikeFromComment = async (req, res) => {
  try {
    logger.info("Removing like from comment");
    const commentId = req.params.commentId;
    const userId = req.user.id;

    if (!commentId || !userId) {
      return res
        .status(400)
        .json({ message: "Comment id and user id are required" });
    }

    // Check if comment exists
    const findComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    if (!findComment || findComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user has liked the comment
    const findLike = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        )
      );
    if (findLike && findLike.length === 0) {
      return res.status(400).json({ message: "Comment not liked by user" });
    }

    // Remove like from comment
    await db
      .delete(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        )
      );

    // Decrement the comment likes count in the comments table
    const updatedComment = await db
      .update(comments)
      .set({
        commentLikesCount: Math.max(0, findComment[0].commentLikesCount - 1),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return res.status(200).json({
      message: "Comment unliked",
      commentLikesCount: updatedComment[0].commentLikesCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// fetch like for comment

export const fetchLikeForComment = async (req, res) => {
  try {
    logger.info("Fetching like for comment");

    const commentId = req.params.commentId;

    if (!commentId) {
      return res.status(400).json({ message: "Comment id is required" });
    }

    //check if comment exists
    const findComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    if (!findComment || findComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //fetch all likes for the comment
    const findLikes = await db
      .select()
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));

    //fetch users who liked the comment
    const userIds = findLikes.map((like) => like.userId);
    const findUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

     

    return res.status(200).json({
      message: "Like fetched",
      likes: findLikes,
      users: findUsers,
      likesCount: findComment[0].commentLikesCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//get liked post users data -> (adding in future)
//get liked commmnet users data   -> (adding in future)



