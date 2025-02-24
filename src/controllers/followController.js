import logger from "../utils/logger.js";
import { users } from "../models/User.js";
import { follows } from "../models/Follow.js";
import { db } from "../config/database.js";
import { and, eq, sql } from "drizzle-orm";
import { colleges } from "../models/College.js";

export const followUser = async (req, res) => {
  try {
    logger.info("Following user...");
    const followerId = req.params.id;
    const userId = req.user.id;

    if (!userId || !followerId) {
      return res
        .status(400)
        .json({ message: "User id and follower id are required" });
    }

    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followeeId, userId))
      );

    if (existingFollow.length > 0) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    await db.insert(follows).values({
      id: crypto.randomUUID(),
      followerId,
      followeeId: userId,
    });

    //update the follower count of the user
    await db
      .update(users)
      .set({ followerCount: sql`follower_count + 1` })
      .where(eq(users.id, followerId));

    //update the following count of the user
    await db
      .update(users)
      .set({ followingCount: sql`following_count + 1` })
      .where(eq(users.id, userId));

    const userfollowData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return res.status(200).json({
      message: "User followed successfully",
      followerCount: userfollowData[0].followerCount,
      followingCount: userfollowData[0].followingCount,
    });
  } catch (error) {
    logger.error("Error following user...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    logger.info("Unfollowing user...");
    const followerId = req.params.id;
    const userId = req.user.id;

    if (!userId || !followerId) {
      return res
        .status(400)
        .json({ message: "User id and follower id are required" });
    }

    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followeeId, userId))
      );

    if (existingFollow.length === 0) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    await db.delete(follows).where(eq(follows.id, existingFollow[0].id));

    //update the follower count of the user
    await db
      .update(users)
      .set({ followerCount: sql`follower_count - 1` })
      .where(eq(users.id, followerId));

    //update the following count of the user
    await db
      .update(users)
      .set({ followingCount: sql`following_count - 1` })
      .where(eq(users.id, userId));

    const userfollowData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return res.status(200).json({
      message: "User unfollowed successfully",
      followerCount: userfollowData[0].followerCount,
      followingCount: userfollowData[0].followingCount,
    });
  } catch (error) {
    logger.error("Error unfollowing user...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get follow status
export const getFollowStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const followerId = req.user.id;

    const followStatus = await db
      .select()
      .from(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followeeId, userId))
      );

    if (followStatus.length > 0) {
      return res.status(200).json({ followStatus: true });
    } else {
      return res.status(200).json({ followStatus: false });
    }
  } catch (error) {
    logger.error("Error getting follow status...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//list of following users

export const getFollowingUsers = async (req, res) => {
  try {
    logger.info("Getting following users...");
    const userId = req.params.id;

    const listofusers = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio
      })
      .from(follows)
      .innerJoin(users, eq(follows.followeeId, users.id))
      .where(eq(follows.followerId, userId));

    return res.json({
      success: true,
      message: "Following users",
      following: listofusers,
    });
  } catch (error) {
    logger.error("Error getting following users...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//list of followers

export const getFollowerUsers = async (req, res) => {
  try {
    logger.info("Getting followers...");
    const userId = req.params.id;

    const listoffollowers = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followeeId, userId));

    return res.json({
      success: true,
      message: "Followers",
      followers: listoffollowers,
    });
  } catch (error) {
    logger.error("Error getting followers...", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
