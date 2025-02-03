import { db } from "../config/database.js";
import { comments } from "../models/Comment.js";
import { replies } from "../models/Reply.js";
import { posts } from "../models/Post.js";
import { users } from "../models/User.js";
import logger from "../utils/logger.js";
import { colleges } from "../models/College.js";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

//add comment
export const addComment = async (req, res) => {
  try {
    logger.info("Adding comment");
    const postId = req.params.postId;
    const authorId = req.user.id;
    const { content } = req.body;

    if (!postId || !authorId || !content) {
      return res.status(400).json({
        message: "Invalid request , missing postId, authorId or content",
      });
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        postId,
        authorId,
        content,
      })
      .returning();

    //get post data
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    //update post comment count
    await db
      .update(posts)
      .set({
        commentsCount: post.commentsCount + 1,
      })
      .where(eq(posts.id, postId));

    res.status(201).json({
      message: "Comment added successfully",
      commentData: newComment,
      commentCount: post.commentsCount + 1,
    });
  } catch (error) {
    logger.error(`Error adding comment: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

//edit comment

export const editComment = async (req, res) => {
  try {
    logger.info("Editing comment...");
    const commentId = req.params.commentId;
    const authorId = req.user.id;
    const { content } = req.body;

    if (!commentId || !content || !authorId) {
      return res.status(400).json({
        message: "Invalid request, missing commentId or content or authorId",
      });
    }

    //check if comment exists and belongs to the user
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.authorId, authorId)));
    if (!existingComment || existingComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //update comment
    const [updatedComment] = await db
      .update(comments)
      .set({ content, updatedAt: new Date(), isEdited: true })
      .where(eq(comments.id, commentId))
      .returning();

    res.status(200).json({
      message: "Comment updated successfully",
      commentData: updatedComment,
    });
  } catch (error) {
    logger.error(`Error editing comment: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

//delete comment

export const deleteComment = async (req, res) => {
  try {
    logger.info("Deleting comment...");
    const commentId = req.params.commentId;
    const authorId = req.user.id;

    if (!commentId || !authorId) {
      return res
        .status(400)
        .json({ message: "Invalid request, missing commentId or authorId" });
    }

    //check if comment exists and belongs to the user
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.authorId, authorId)));
    if (!existingComment || existingComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get the current post data
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, existingComment.postId));

    //delete comment
    await db.delete(comments).where(eq(comments.id, commentId));

    //update post comment count
    await db
      .update(posts)
      .set({ commentsCount: post.commentsCount - 1 })
      .where(eq(posts.id, existingComment.postId));

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting comment: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

//get single comment

export const getSingleComment = async (req, res) => {
  try {
    logger.info("Getting single comment...");
    const commentId = req.params.commentId;

    //check if comment exists
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    if (!existingComment || existingComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //get comment data
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    res.status(200).json({
      message: "Comment fetched successfully",
      commentData: comment,
    });
  } catch (error) {
    logger.error(`Error getting single comment: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

//get all comments for a post

export const getAllCommentsForPost = async (req, res) => {
  try {
    logger.info("Getting comments for a post with pagination...");
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get paginated comments for the post
    const commentsData = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt, "desc")
      .limit(limit)
      .offset(offset);

    // Get total comments count
    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(comments)
      .where(eq(comments.postId, postId));

    // Map through comments to get author and college data
    const AllComments = await Promise.all(
      commentsData.map(async (comment) => {
        // Get author data for each comment
        const [authorData] = await db
          .select()
          .from(users)
          .where(eq(users.id, comment.authorId));

        // Get college data for the author
        const [collegeData] = await db
          .select()
          .from(colleges)
          .where(eq(colleges.id, authorData.collegeId));

        return {
          comment: comment,
          author: {
            id: authorData.id,
            username: authorData.username,
            avatar: authorData.avatar,
            verifiedBadge: authorData.verifiedBadge,
            collegeId: authorData.collegeId,
            gender: authorData.gender,
            bio: authorData.bio,
            followerCount: authorData.followerCount,
            followingCount: authorData.followingCount,
            status: authorData.status,
            allowDms:authorData.allowDMs,
            isTemporary:authorData.isTemporary,
            lastActive:authorData.lastActive,
            isTemporary:authorData.isTemporary
            
          },
          authorCollege: {
            id: collegeData.id,
            name: collegeData.name,
            location: collegeData.location,
          },
        };
      })
    );

    res.status(200).json({
      message: "Comments fetched successfully",
      totalComments: totalCount.count,
      currentPage: page,
      hasMore: offset + commentsData.length < totalCount.count,
      commentData: AllComments,
    });
  } catch (error) {
    logger.error(`Error getting comments for a post: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};


