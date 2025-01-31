import { db } from "../config/database.js";
import { eq, like, or } from "drizzle-orm";
import { users } from "../models/User.js";
import logger from "../utils/logger.js";
import { colleges } from "../models/College.js";

//search user by username and college name
export const searchUser = async (req, res) => {
  try {
    const query = req.query.q?.toString().trim() || "";
    logger.info(`Searching for user with query: ${query}`);

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        college: colleges.name,
        collegeLocation: colleges.location,
      })
      .from(users)
      .leftJoin(colleges, eq(users.collegeId, colleges.id))
      .where(
        or(
          like(users.username, `%${query}%`),
          like(colleges.name, `%${query}%`)
        )
      );

    logger.info(`Found ${result.length} users matching query: ${query}`);
    res.status(200).json({
      message: "User search successful",
      data: result,
    });
  } catch (error) {
    logger.error(`Error searching for user: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


