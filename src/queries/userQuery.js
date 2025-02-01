import { db } from "../config/database.js";
import { eq, like, or, sql } from "drizzle-orm";
import { users } from "../models/User.js";
import logger from "../utils/logger.js";
import { colleges } from "../models/College.js";

//search user by username and college name
export const searchUser = async (req, res) => {
  try {
    const query = req.query.q?.toString().trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Show 10 results per page
    const offset = (page - 1) * limit;

    logger.info(`Searching for user with query: ${query}, page: ${page}`);

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const [results, totalCount] = await Promise.all([
      // Get paginated results
      db
        .select({
          id: users.id,
          username: users.username,
          avatar: users.avatar,
          college: colleges.name,
          verifiedBadge: users.verifiedBadge,
          collegeLocation: colleges.location,
        })
        .from(users)
        .leftJoin(colleges, eq(users.collegeId, colleges.id))
        .where(
          or(
            like(users.username, `%${query}%`),
            like(colleges.name, `%${query}%`)
          )
        )
        .limit(limit)
        .offset(offset),

      // Get total count for pagination
      db
        .select({ count: sql`count(*)` })
        .from(users)
        .leftJoin(colleges, eq(users.collegeId, colleges.id))
        .where(
          or(
            like(users.username, `%${query}%`),
            like(colleges.name, `%${query}%`)
          )
        ),
    ]);

    logger.info(
      `Found ${totalCount[0].count} total users matching query: ${query}`
    );
    res.status(200).json({
      message: "User search successful",
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalResults: totalCount[0].count,
        hasMore: results.length === limit,
      },
    });
  } catch (error) {
    logger.error(`Error searching for user: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

//mutual collgemates suggestion

export const mutualCollegeFriends = async (req, res) => {
  try {
    logger.info("Fetching mutual college friends");
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 16; // Show 16 users per page
    const offset = (page - 1) * limit;

    // Get the user's college ID first
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get paginated users and total count
    const [mutualUsers, totalCount] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          avatar: users.avatar,
          verifiedBadge: users.verifiedBadge,
          collegeName: colleges.name,
          bio: users.bio,
          collegeLocation: colleges.location,
          followerCount: users.followerCount,
        })
        .from(users)
        .leftJoin(colleges, eq(users.collegeId, colleges.id))
        .where(
          sql`${users.collegeId} = ${userData[0].collegeId} AND ${users.id} != ${userId}`
        )
        .limit(limit)
        .offset(offset),

      // Get total count
      db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(
          sql`${users.collegeId} = ${userData[0].collegeId} AND ${users.id} != ${userId}`
        ),
    ]);

    res.status(200).json({
      message: "Mutual college users fetched successfully",
      data: mutualUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalResults: totalCount[0].count,
        hasMore: mutualUsers.length === limit,
      },
    });
  } catch (error) {
    logger.error(`Error fetching mutual college users: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
