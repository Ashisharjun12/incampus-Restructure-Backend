import { db } from "../config/database.js";
import { comments } from "../models/Comment.js";
import { replies } from "../models/Reply.js";
import { posts } from "../models/Post.js";
import { users } from "../models/User.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export const addComment = async (req, res) => {
  try {
    logger.info("Adding comment");
    const { postId } = req.params;
    const { authorId } = req.user;
    const { content } = req.body;

    //check if comment is empty
    if (!content) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    //check if post exists
    const checkPost = await db.select().from(posts).where(eq(posts.id, postId));
    if (!checkPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    //check if user exists
    const checkUser = await db
      .select()
      .from(users)
      .where(eq(users.id, authorId));
    if (!checkUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if user has already commented on this post
    const checkComment = await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.authorId, authorId)));
    if (checkComment) {
      return res
        .status(400)
        .json({ message: "User has already commented on this post" });
    }

    //make new comment
    const newComment = await db
      .insert(comments)
      .values({ postId, authorId, content });
    res.status(201).json(newComment);

   
  } catch (error) {
    logger.error(`Error adding comment: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};
