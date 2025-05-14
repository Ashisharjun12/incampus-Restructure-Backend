import { admins } from "../models/Admin.js";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/User.js";
import logger from "../utils/logger.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/tokenService.js";

const generateAccessRefreshToken = async (userPayload) => {
  logger.info("Generating access and refresh token admin...");
  const accessToken = generateAccessToken({
    id: userPayload.id,
    email: userPayload.email,
    role: userPayload.role,
  });
  const refreshToken = generateRefreshToken({
    id: userPayload.id,
    email: userPayload.email,
    role: userPayload.role,
  });

  //update refresh token in database
  await db
    .update(admins)
    .set({ refreshToken: refreshToken })
    .where(eq(admins.id, userPayload.id));
  return { accessToken, refreshToken };
};

export const createAdmin = async (req, res) => {
  try {
    logger.info("Admin route hit...");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if admin already exists
    const adminExists = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email));

    if (adminExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create admin
    const [newAdmin] = await db
      .insert(admins)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      })
      .returning();

    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      newAdmin
    );

    //set cookie
    res.cookie("access_token", accessToken);
    res.cookie("refresh_token", refreshToken);

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        admin: newAdmin,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(error, "Error in creating admin");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    logger.info("Admin login route hit...");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if admin exists
    const adminExists = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email));

    if (adminExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Admin does not exist",
      });
    }

    const admin = adminExists[0];

    //check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      admin
    );

    //set cookie
    res.cookie("access_token", accessToken);
    res.cookie("refresh_token", refreshToken);
    //set is active true is in db
    await db
      .update(admins)
      .set({ isActive: true })
      .where(eq(admins.id, admin.id));

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        admin,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(error, "Error in logging in admin");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    logger.info("Admin logout route hit...");
    //get admin id from request middleware
    const adminId = req.admin.id;

    //clear cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    //update refresh token in database
    await db
      .update(admins)
      .set({ refreshToken: null , isActive: false , lastLogin: new Date() })
      .where(eq(admins.id, adminId));



    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    logger.error(error, "Error in logging out admin");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getAccountDeleteReq = async(req,res)=>{
  try {
    logger.info("hitting account delete route...");

    const userdata = await db.select().from(users).where(eq(users.accountDeletationReq, true));
    
    return res.status(200).json({
      success: true,
      message: "Account deletion requests fetched successfully",
      data: userdata
    });
  } catch (error) {
    logger.info("getting error of account delete...",error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching account deletion requests"
    });
  }
}


export const AccountDeleteUser = async(req,res)=>{
  try {
    logger.info("hitting account delete user....")

    const userId = req.params.id;

    const [getUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!getUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!getUser.accountDeletationReq) {
      return res.status(400).json({
        success: false,
        message: "User has not requested account deletion"
      });
    }

    await db.delete(users).where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    logger.info("error in account delete", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting user account"
    });
  }
}
