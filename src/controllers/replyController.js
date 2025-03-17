import { db } from "../config/database.js";
import { users } from "../models/User.js";
import { comments } from "../models/Comment.js";
import { replies } from "../models/Reply.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

//add reply to comment
export const addReply = async (req, res) => {
  try {
    logger.info("Adding reply to commnet..");

    const commentId = req.params.commentId;
    const { content ,gifurl,gifId} = req.body;
    const authorId = req.user.id;

    if (!commentId || !authorId) {
      return res.status(400).json({ message: "Invalid request" });
    }

//add gifs to db
const gifUrls =[]
gifUrls.push({
  url:gifurl,
  id:gifId
})



    //check if comment exists
    const [findComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    if (!findComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //check if user exists
    const [findUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authorId));
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //add reply to comment
    const [newReply] = await db
      .insert(replies)
      .values({
        id: crypto.randomUUID(),
        commentId,
        authorId,
        content,
        gifurl : gifUrls
      })
      .returning();

    //update comment reply count
    await db
      .update(comments)
      .set({
        commentRepliesCount: findComment.commentRepliesCount + 1,
      })
      .where(eq(comments.id, commentId));

    res.status(201).json({
      message: "Reply added successfully",
      replyData: newReply,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//edit reply

export const editReply = async (req, res) => {
  try {
    logger.info("Editing reply on comment..");

    const replyId = req.params.replyId;
    const { content } = req.body;
    const authorId = req.user.id;

    if (!replyId || !content || !authorId) {
      return res
        .status(400)
        .json({
          message: "Invalid request , missing replyId, content or authorId",
        });
    }

    //check if reply exists
    const [findReply] = await db
      .select()
      .from(replies)
      .where(eq(replies.id, replyId));
    if (!findReply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    //check if user is the author of the reply
    if (findReply.authorId !== authorId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this reply" });
    }

    //update reply content
    const [updatedReply] = await db
      .update(replies)
      .set({
        content,
        isEdited: true,
      })
      .where(eq(replies.id, replyId))
      .returning();

    res.status(200).json({
      message: "Reply edited successfully",
      replyData: updatedReply,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete reply

export const deleteReply = async (req, res) => {
  try {
    logger.info("Deleting reply on comment..");
    const replyId = req.params.replyId;
    const authorId = req.user.id;

    if (!replyId || !authorId) {
      return res
        .status(400)
        .json({ message: "Invalid request , missing replyId or authorId" });
    }

    //check if reply exists
    const [findReply] = await db
      .select()
      .from(replies)
      .where(eq(replies.id, replyId));
    if (!findReply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    //check if user is the author of the reply
    if (findReply.authorId !== authorId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this reply" });
    }

    //delete reply
    await db.delete(replies).where(eq(replies.id, replyId));

    //get comment data
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, findReply.commentId));

    //update comment reply count
    await db
      .update(comments)
      .set({
        commentRepliesCount: comment.commentRepliesCount - 1,
      })
      .where(eq(comments.id, findReply.commentId));

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//get all replies for a comment
export const getAllRepliesForComment = async (req, res) => {
    try {
        logger.info("Getting all replies for a comment..");
        const commentId = req.params.commentId;
        
        //check if comment exists
        const [findComment] = await db.select().from(comments).where(eq(comments.id, commentId));
        if(!findComment){
            return res.status(404).json({message: "Comment not found"});
        }

        //get all replies for the comment
        const getAllReplies = await db.select().from(replies).where(eq(replies.commentId, commentId));

        res.status(200).json({
            message: "Replies fetched successfully",
            replies: getAllReplies,
        });

    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//get all replies on post - (future query)
