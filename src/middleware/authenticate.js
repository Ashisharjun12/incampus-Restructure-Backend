import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import { db } from "../config/database.js";
import { users } from "../models/User.js";
import { admins } from "../models/Admin.js";
import logger from "../utils/logger.js";
import { eq } from "drizzle-orm";

export const authenticateUser = async (req, res, next) => {
  logger.info("Authenticating request...");
  let token = null;
  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers?.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log("token,,", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Decoded token User: ${JSON.stringify(decoded)}`);

    //find user
    const finduser = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));

    if (finduser.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }
    req.user = finduser[0];
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Session expired or invalid",
    });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  logger.info("Authenticating admin request...");

  let token = null;
  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers?.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  logger.info(`Token received: ${token}`);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Decoded token Admin: ${JSON.stringify(decoded)}`);

    const findAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, decoded.id));

    if (findAdmin.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Admin not found",
      });
    }
    req.admin = findAdmin[0];
    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Session expired or invalid",
    });
  }
};
