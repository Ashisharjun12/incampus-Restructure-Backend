import logger from "../utils/logger.js";
import { db } from "../config/database.js";
import { posts } from "../models/Post.js";
import { users } from "../models/User.js";
import { colleges } from "../models/College.js";
import crypto from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import { likes } from "../models/Like.js";
import { savedPosts } from "../models/SavedPost.js";
import { deleteObject } from "../utils/s3.js";
import { extractHashtags, getOrCreateHashtags, createPostHashtagAssociations } from "../controllers/hashtagController.js";

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
          url: file.location, 
          key: file.key, 
          mimetype: file.mimetype 
        });
        
        logger.info(`Added file to post: ${file.key} (${fileType})`);
      }
    }

    console.log("Media URLs:", mediaurls);

    // Generate a post ID
    const postId = crypto.randomUUID();
    
    // Create post in db
    const [newPost] = await db
      .insert(posts)
      .values({
        id: postId,
        authorId: userId,
        content: content,
        media: mediaurls,
        mediaType: mediaType || (mediaurls.length > 0 ? mediaurls[0].type : null),
        visibility: visibility,
      })
      .returning();

    console.log("New post created:", newPost);
    
    // Process hashtags if there's content
    if (content) {
      try {
        // Extract hashtags from content
        const extractedTags = extractHashtags(content);
        
        if (extractedTags.length > 0) {
          logger.info(`Found ${extractedTags.length} hashtags in post: ${extractedTags.join(', ')}`);
          
          // Get or create hashtag records
          const hashtagRecords = await getOrCreateHashtags(extractedTags);
          
          // Link hashtags to post
          await createPostHashtagAssociations(
            postId, 
            hashtagRecords.map(tag => tag.id)
          );
          
          logger.info(`Associated ${hashtagRecords.length} hashtags with post ${postId}`);
        }
      } catch (hashtagError) {
        // Log the error but don't fail the post creation
        logger.error("Error processing hashtags for post:", hashtagError);
      }
    }

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
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 12;
    const offset = (validatedPage - 1) * validatedLimit;

    // const userdetails = await 

    // Get total count of all posts
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(posts);

    const totalPosts = Number(totalResult[0].count);
    const totalPages = Math.ceil(totalPosts / validatedLimit);

    // Get paginated posts
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt)) // Ensure consistent ordering
      .limit(validatedLimit)
      .offset(offset);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: allPosts,
      // collgeId: collgeId,
      pagination: {
        currentPage: validatedPage,
        limit: validatedLimit,
        totalPosts,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPrevPage: validatedPage > 1
      }
    });
  } catch (error) {
    logger.error("Error getting all posts...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPostBySameCollege = async (req, res) => {
  try {
    logger.info("Getting all posts by same college...");
    
    // Get current user's college ID from auth token
    const userId = req.user.id;
    const [userDetails] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!userDetails?.collegeId) {
      return res.status(400).json({ message: "User college not found" });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 12;
    const offset = (validatedPage - 1) * validatedLimit;

    // Get total count of posts from same college
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(users.collegeId, userDetails.collegeId));

    const totalPosts = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(totalPosts / validatedLimit);

    // Get paginated posts from same college
    const collegePosts = await db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(users.collegeId, userDetails.collegeId))
      .orderBy(desc(posts.createdAt))
      .limit(validatedLimit)
      .offset(offset);

    res.status(200).json({
      message: "College posts fetched successfully",
      posts: collegePosts.map(p => p.posts), // Extract post data
      pagination: {
        currentPage: validatedPage,
        limit: validatedLimit,
        totalPosts,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPrevPage: validatedPage > 1
      }
    });
  } catch (error) {
    logger.error("Error getting posts by same college...", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//get post by id

export const getPostById = async (req, res) => {
  try {
    logger.info("Getting post by id...");

    const postId = req.params.id;
    const userId = req.user?.id; 

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

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 9;
    const offset = (validatedPage - 1) * validatedLimit;

    // Get total count of posts for this author
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .where(eq(posts.authorId, authorId));

    const totalPosts = Number(totalResult[0].count);
    const totalPages = Math.ceil(totalPosts / validatedLimit);

    // Get paginated posts
    const authorPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt))
      .limit(validatedLimit)
      .offset(offset);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: authorPosts,
      pagination: {
        currentPage: validatedPage,
        limit: validatedLimit,
        totalPosts,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPrevPage: validatedPage > 1
      }
    });
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

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 9;
    const offset = (validatedPage - 1) * validatedLimit;

    // Get total count of posts for this user
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .where(eq(posts.authorId, userId));

    const totalPosts = Number(totalResult[0].count);
    const totalPages = Math.ceil(totalPosts / validatedLimit);

    // Get paginated posts
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt)) // Ensure consistent ordering
      .limit(validatedLimit)
      .offset(offset);

    res.status(200).json({
      message: "Post fetched successfully",
      post: userPosts,
      pagination: {
        currentPage: validatedPage,
        limit: validatedLimit,
        totalPosts,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPrevPage: validatedPage > 1
      }
    });
  } catch (error) {
    logger.error("Error getting post by user id...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update post by id

export const updatePostById = async (req, res) => {
  try {
    logger.info("Updating post by id...");
    const postId = req.params.id;
    const userId = req.user.id;
    const { content, visibility } = req.body;
    const files = req.files;
    let keepMedia = [];
    if (req.body.keepMedia) {
      try {
        keepMedia = JSON.parse(req.body.keepMedia);
      } catch (e) {
        logger.error('Invalid keepMedia JSON:', req.body.keepMedia);
        return res.status(400).json({ message: 'Invalid keepMedia format' });
      }
    }

    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    // Get the post
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== userId) {
      return res.status(403).json({ message: "Unauthorized: not your post" });
    }

    let mediaurls = keepMedia.length > 0 ? keepMedia : [];
    // Delete removed images from S3
    if (post.media && post.media.length > 0) {
      for (const oldMedia of post.media) {
        const stillKept = keepMedia.some(k => (k.key || k) === (oldMedia.key || oldMedia));
        if (!stillKept && oldMedia.key) {
          try {
            logger.info(`Deleting removed S3 object: ${oldMedia.key}`);
            await deleteObject(oldMedia.key);
          } catch (error) {
            logger.error(`Error deleting S3 object ${oldMedia.key}:`, error);
          }
        }
      }
    }
    // Add new media uploads
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.location || !file.key) {
          logger.error("Invalid S3 file object:", file);
          return res.status(500).json({ message: "Error with file upload to S3" });
        }
        const fileType = file.mimetype.startsWith('video/') ? 'video' : file.mimetype.startsWith('audio/') ? 'audio' : 'image';
        mediaurls.push({
          type: fileType,
          url: file.location,
          key: file.key,
          mimetype: file.mimetype
        });
      }
    }

    // Update the post
    const [updatedPost] = await db.update(posts)
      .set({
        content: content !== undefined ? content : post.content,
        media: mediaurls,
        visibility: visibility !== undefined ? visibility : post.visibility,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning();

    return res.status(200).json({ message: "Post updated successfully", post: updatedPost });
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
