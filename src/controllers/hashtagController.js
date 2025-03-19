import logger from "../utils/logger.js";
import { db } from "../config/database.js";
import { hashtags, postHashtags } from "../models/Post.js";
import { eq, sql } from "drizzle-orm";

export const extractHashtags = (content) => {
  try {
    const hashtagRegex = /#(\w+)/g;
    const matches = content ? content.match(hashtagRegex) : null;
    return matches 
      ? [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))] // Remove # and convert to lowercase
      : [];
  } catch (error) {
    logger.error("Error extracting hashtags", error);
    return [];
  }
};

export const getOrCreateHashtags = async (tagNames) => {
  try {
    const results = [];
    
    for (const tagName of tagNames) {
      // Try to find existing hashtag
      let [existingTag] = await db
        .select()
        .from(hashtags)
        .where(eq(hashtags.tag, tagName));
      
      // If not found, create it
      if (!existingTag) {
        [existingTag] = await db
          .insert(hashtags)
          .values({ tag: tagName })
          .returning();
        
        logger.info(`Created new hashtag: #${tagName}`);
      }
      
      results.push(existingTag);
    }
    
    return results;
  } catch (error) {
    logger.error("Error processing hashtags", error);
    throw error;
  }
};

export const createPostHashtagAssociations = async (postId, hashtagIds) => {
  try {
    const associations = [];
    
    for (const hashtagId of hashtagIds) {
      const [association] = await db
        .insert(postHashtags)
        .values({
          postId: postId,
          hashtagId: hashtagId
        })
        .returning();
      
      associations.push(association);
    }
    
    return associations;
  } catch (error) {
    logger.error(`Error linking hashtags to post ${postId}`, error);
    throw error;
  }
};

export const getPostsByHashtag = async (req, res) => {
  try {
    const tagName = req.params.tag.toLowerCase();
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Find the hashtag
    const [tag] = await db
      .select()
      .from(hashtags)
      .where(eq(hashtags.tag, tagName));
    
    if (!tag) {
      return res.status(404).json({ message: "Hashtag not found" });
    }
    
    // Get total count for pagination
    const [countResult] = await db.execute(sql`
      SELECT COUNT(DISTINCT p.id) as count
      FROM posts p
      JOIN post_hashtags ph ON p.id = ph.post_id
      WHERE ph.hashtag_id = ${tag.id}
    `);
    
    const totalPosts = Number(countResult.count);
    
    // Get posts with this hashtag
    const posts = await db.execute(sql`
      SELECT p.*
      FROM posts p
      JOIN post_hashtags ph ON p.id = ph.post_id
      WHERE ph.hashtag_id = ${tag.id}
      ORDER BY p.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    return res.status(200).json({
      message: "Posts fetched successfully",
      hashtag: `#${tag.tag}`,
      posts: posts,
      pagination: {
        currentPage: page,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: page * limit < totalPosts,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    logger.error("Error getting posts by hashtag", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTrendingHashtags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const trendingTags = await db.execute(sql`
      SELECT h.tag, COUNT(ph.post_id) as post_count
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      GROUP BY h.id, h.tag
      ORDER BY post_count DESC
      LIMIT ${limit}
    `);
    
    return res.status(200).json({
      message: "Trending hashtags fetched successfully",
      hashtags: trendingTags.map(tag => ({
        tag: `#${tag.tag}`,
        count: Number(tag.post_count)
      }))
    });
  } catch (error) {
    logger.error("Error getting trending hashtags", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all hashtags with post count
export const getAllHashtags = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get total count of hashtags
    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(hashtags);
    
    // Get hashtags with post count
    const allHashtags = await db.execute(sql`
      SELECT 
        h.id,
        h.tag,
        COUNT(DISTINCT ph.post_id) as post_count,
        MAX(p.created_at) as latest_post_date
      FROM hashtags h
      LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
      LEFT JOIN posts p ON ph.post_id = p.id
      GROUP BY h.id, h.tag
      ORDER BY post_count DESC, latest_post_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    return res.status(200).json({
      message: "Hashtags fetched successfully",
      hashtags: allHashtags.map(tag => ({
        id: tag.id,
        tag: `#${tag.tag}`,
        postCount: Number(tag.post_count),
        latestPost: tag.latest_post_date
      })),
      pagination: {
        currentPage: page,
        totalHashtags: Number(totalCount.count),
        totalPages: Math.ceil(Number(totalCount.count) / limit),
        hasNextPage: page * limit < Number(totalCount.count),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    logger.error("Error getting all hashtags", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Search hashtags
export const searchHashtags = async (req, res) => {
  try {
    const searchQuery = req.query.q?.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Get total count of matching hashtags
    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(hashtags)
      .where(sql`tag LIKE ${`%${searchQuery}%`}`);
    
    // Search hashtags with post count and latest posts
    const searchResults = await db.execute(sql`
      SELECT 
        h.id,
        h.tag,
        COUNT(DISTINCT ph.post_id) as post_count,
        MAX(p.created_at) as latest_post_date,
        ARRAY_AGG(
          DISTINCT jsonb_build_object(
            'id', p.id,
            'content', p.content,
            'media', p.media,
            'created_at', p.created_at
          )
        ) FILTER (WHERE p.id IS NOT NULL) as recent_posts
      FROM hashtags h
      LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
      LEFT JOIN posts p ON ph.post_id = p.id
      WHERE h.tag LIKE ${`%${searchQuery}%`}
      GROUP BY h.id, h.tag
      ORDER BY post_count DESC, latest_post_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    return res.status(200).json({
      message: "Search results fetched successfully",
      results: searchResults.map(tag => ({
        id: tag.id,
        tag: `#${tag.tag}`,
        postCount: Number(tag.post_count),
        latestPost: tag.latest_post_date,
        recentPosts: (tag.recent_posts || []).slice(0, 3) // Get up to 3 recent posts
      })),
      pagination: {
        currentPage: page,
        totalResults: Number(totalCount.count),
        totalPages: Math.ceil(Number(totalCount.count) / limit),
        hasNextPage: page * limit < Number(totalCount.count),
        hasPrevPage: page > 1
      }
    });
   } catch (error) {
    logger.error("Error searching hashtags", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get hashtag details with recent posts
export const getHashtagDetails = async (req, res) => {
  try {
    const tagId = req.params.id;
    
    // First, get the hashtag basic info
    const [hashtagBasic] = await db.execute(sql`
      SELECT 
        h.id,
        h.tag,
        COUNT(DISTINCT ph.post_id) as post_count,
        MAX(p.created_at) as latest_post_date
      FROM hashtags h
      LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
      LEFT JOIN posts p ON ph.post_id = p.id
      WHERE h.id = ${tagId}
      GROUP BY h.id, h.tag
    `);
    
    if (!hashtagBasic) {
      return res.status(404).json({ message: "Hashtag not found" });
    }

    // Then, get the associated posts separately
    const posts = await db.execute(sql`
      SELECT DISTINCT
        p.id,
        p.content,
        p.media,
        p.created_at,
        p.likes_count,
        p.comments_count
      FROM posts p
      JOIN post_hashtags ph ON p.id = ph.post_id
      WHERE ph.hashtag_id = ${tagId}
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    return res.status(200).json({
      message: "Hashtag details fetched successfully",
      hashtag: {
        id: hashtagBasic.id,
        tag: `#${hashtagBasic.tag}`,
        postCount: Number(hashtagBasic.post_count),
        latestPost: hashtagBasic.latest_post_date,
        posts: posts || []
      }
    });
  } catch (error) {
    logger.error("Error getting hashtag details", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



