import logger from "../utils/logger.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { db } from "../config/database.js";
import { posts } from "../models/Post.js";
import { users } from "../models/User.js";
import { colleges } from "../models/College.js";
import crypto from "crypto";
import { eq } from "drizzle-orm";

export const createPost = async (req, res) => {
  try {
    logger.info("Creating post endpoint...");

    const { content, mediaType, visibility } = req.body;
    const files = req.files;

    if (!files && !content) {
      return res
        .status(400)
        .json({ message: "Either media or content is required" });
    }

    // get user id from token
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let mediaurls = [];

    //handle media on cloudinary
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResponse = await uploadOnCloudinary(file.path);
          if (uploadResponse) {
            mediaurls.push({
              type: mediaType || "image",
              url: uploadResponse.url,
              id: uploadResponse.public_id,
            });
          }
        } catch (error) {
          logger.error("Error uploading media on cloudinary...", error);
          return res.status(500).json({ message: "Error uploading media" });
        }
      }
    }

    //create post in db
    const [newPost] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        authorId: userId,
        content: content,
        media: mediaurls,
        mediaType: mediaType,
        visibility: visibility,
      })
      .returning();

    return res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    logger.error("Error creating post endpoint...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all post

export const getAllPosts = async (req, res) => {
  try {
    logger.info("Getting all posts...");
    const getAllPosts = await db.select().from(posts);
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: getAllPosts,
      count: getAllPosts.length,
    });
  } catch (error) {
    logger.error("Error getting all posts...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get post by id

export const getPostById = async (req, res) => {
  try {
    logger.info("Getting post by id...");

    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId));

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, post.authorId));

      const [collegeData] = await db.select().from(colleges).where(eq(colleges.id, userData.collegeId));

    const postData = {
      ...post,
      avatar: userData?.avatar,
      username: userData?.username,
      gender: userData?.gender,
      collegeName: collegeData?.name,
      collegeLocation: collegeData?.location,
      bio: userData?.bio,


    };

    res
      .status(200)
      .json({ message: "Post fetched successfully", post: postData });
  } catch (error) {
    logger.error("Error getting post by id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get post by author id

export const getPostByAuthorId = async (req, res) => {
  try {
    logger.info("Getting post by author id...");

    const authorId = req.params.id;

    if (!authorId) {
      return res.status(400).json({ message: "Author id is required" });
    }

    const getPostByAuthorId = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId));

    res
      .status(200)
      .json({ message: "Post fetched successfully", post: getPostByAuthorId });
  } catch (error) {
    logger.error("Error getting post by author id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//delete post by id

export const deletePostById = async (req, res) => {
  try {
    logger.info("Deleting post by id...");

    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    const deletePostById = await db.delete(posts).where(eq(posts.id, postId));
    return res.status(200).json({ message: "Post deleted successfully", post: deletePostById });
    
  } catch (error) {
    logger.error("Error deleting post by id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


//get post by user id

export const getPostByUserId = async (req, res) => {
  try {
    logger.info("Getting post by user id...");
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const getPostByUserId = await db.select().from(posts).where(eq(posts.authorId, userId));
    res.status(200).json({ message: "Post fetched successfully", post: getPostByUserId });
    
  } catch (error) {
    logger.error("Error getting post by user id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// update post by id

export const updatePostById = async (req, res) => {
  try {
    logger.info("Updating post by id...");
    
    
  } catch (error) {
    logger.error("Error updating post by id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

