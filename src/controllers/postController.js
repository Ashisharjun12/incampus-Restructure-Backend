import logger from "../utils/logger.js";
import { db } from "../config/database.js";
import { posts } from "../models/Post.js";
import { users } from "../models/User.js";
import { colleges } from "../models/College.js";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { likes } from "../models/Like.js";
import { savedPosts } from "../models/SavedPost.js";
import { deleteObject } from "../utils/s3.js";

export const createPost = async (req, res) => {
  try {
    logger.info("Creating post endpoint with S3...");

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

    // Handle S3 file uploads
    if (files && files.length > 0) {
      logger.info(`Processing ${files.length} files uploaded to S3`);
      
      for (const file of files) {
        if (!file.location || !file.key) {
          logger.error("Invalid S3 file object:", file);
          return res.status(500).json({ message: "Error with file upload to S3" });
        }
        
        // Determine media type based on mimetype if not explicitly specified
        const fileType = mediaType || 
          (file.mimetype.startsWith('video/') ? 'video' : 
           file.mimetype.startsWith('audio/') ? 'audio' : 'image');
        
        mediaurls.push({
          type: fileType,
          url: file.location, // S3 URL from multer-s3
          key: file.key, // S3 key for future deletion
          mimetype: file.mimetype // Store mimetype for reference
        });
        
        logger.info(`Added file to post: ${file.key} (${fileType})`);
      }
    }

    console.log("Media URLs:", mediaurls);

    //create post in db
    const [newPost] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        authorId: userId,
        content: content,
        media: mediaurls,
        mediaType: mediaType || (mediaurls.length > 0 ? mediaurls[0].type : null),
        visibility: visibility,
      })
      .returning();

    console.log("New post created:", newPost);

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
    const userId = req.user?.id; // Get current user id if authenticated

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get all likes for this post
    const postLikes = await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));

    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, post.authorId));

    const [collegeData] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, userData.collegeId));

    const postData = {
      ...post,
      likes: postLikes, // Include likes data
      isLiked: userId
        ? postLikes.some((like) => like.userId === userId)
        : false,
      avatar: userData?.avatar,
      username: userData?.username,
      gender: userData?.gender,
      collegeName: collegeData?.name,
      collegeLocation: collegeData?.location,
      bio: userData?.bio,
      verifiedBadge: userData?.verifiedBadge,
      followerCount: userData?.followerCount,
      followingCount: userData?.followingCount,
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

    // First get the post to check for media to delete
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete associated media files from S3
    if (post.media && post.media.length > 0) {
      for (const media of post.media) {
        if (media.key) {
          try {
            logger.info(`Deleting S3 object: ${media.key}`);
            await deleteObject(media.key);
          } catch (error) {
            logger.error(`Error deleting S3 object ${media.key}:`, error);
            // Continue with deletion even if media deletion fails
          }
        }
      }
    }

    // Delete the post from database
    const deletePostById = await db.delete(posts).where(eq(posts.id, postId));
    
    return res
      .status(200)
      .json({ message: "Post deleted successfully", post: deletePostById });
  } catch (error) {
    logger.error("Error deleting post by id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get post by user id

export const getPostByUserId = async (req, res) => {
  try {
    logger.info("Getting post by user id...");
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const getPostByUserId = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId));
    res
      .status(200)
      .json({ message: "Post fetched successfully", post: getPostByUserId });
  } catch (error) {
    logger.error("Error getting post by user id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update post by id

export const updatePostById = async (req, res) => {
  try {
    logger.info("Updating post by id...");
    // Implementation needed
    res.status(501).json({ message: "Feature not implemented yet" });
  } catch (error) {
    logger.error("Error updating post by id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//saved post

export const savePost = async (req, res) => {
  try {
    logger.info("Saving post...");

    const postId = req.params.id;
    const userId = req.user.id;

    if (!postId || !userId) {
      return res.status(400).json({ message: "Post id and user id are required" });
    }

    // Implementation needed
    res.status(501).json({ message: "Feature not implemented yet" });
  } catch (error) {
    logger.error("Error saving post...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
