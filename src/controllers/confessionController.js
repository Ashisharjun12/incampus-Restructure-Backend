import logger from "../utils/logger.js";
import { users } from "../models/User.js";
import { follows } from "../models/Follow.js";
import { db } from "../config/database.js";
import { and, eq, sql } from "drizzle-orm";
import { colleges } from "../models/College.js";

export const createConfession = async(req, res) => {
  try {
    logger.info("creating confession");

    const userId = req.user.id;
    const { content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }






  } catch (error) {
    logger.error(error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
