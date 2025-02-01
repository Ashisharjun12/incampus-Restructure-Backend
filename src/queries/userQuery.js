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
        )
    ]);

    logger.info(`Found ${totalCount[0].count} total users matching query: ${query}`);
    res.status(200).json({
      message: "User search successful",
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalResults: totalCount[0].count,
        hasMore: results.length === limit
      }
    });
  } catch (error) {
    logger.error(`Error searching for user: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


