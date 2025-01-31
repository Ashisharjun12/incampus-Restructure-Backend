import { db } from "../config/database.js";
import logger from "../utils/logger.js";
import { colleges } from "../models/College.js";
import { users } from "../models/User.js";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../services/emaiService.js";
import { posts } from "../models/Post.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/tokenService.js";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const generateAccessRefreshToken = async (userPayload) => {
  logger.info("Generating access and refresh token user...");
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
    .update(users)
    .set({
      refreshToken: refreshToken,
    })
    .where(eq(users.id, userPayload.id));

  return { accessToken, refreshToken };
};

const createActivationToken = (userdata) => {
  const otp = Math.floor(100000 + Math.random() * 90000).toString(); //6 digit otp

  const token = jwt.sign(
    { userdata, otp },
    process.env.ACTIVATION_TOKEN_SECRET,
    { expiresIn: "5m" }
  );
  return { otp, token };
};

export const RegisterUser = async (req, res) => {
  try {
    logger.info("Creating user endpoint hit");
    const { username, email, password, avatar, gender, age, college } =
      req.body;

    if (
      !username ||
      !email ||
      !password ||
      !avatar ||
      !gender ||
      !age ||
      !college
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if college exists
    const findCollege = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, college));

    if (findCollege.length === 0) {
      return res.status(400).json({
        success: false,
        message: "College does not exist",
      });
    }

    //check if user already exists
    const findUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (findUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userdata = {
      username,
      email,
      password: hashedPassword,
      avatar,
      gender,
      age,
      collegeId: college,
      role: "user",
    };

    //get activation token
    const activationToken = createActivationToken(userdata);
    const activationOtp = activationToken.otp;

    //send activation email
    try {
      await sendVerificationEmail(userdata.email, activationOtp);

      return res.status(200).json({
        success: true,
        message: "Activation email sent successfully",
        data: userdata,
        activationToken: activationToken,
        activationOtp: activationOtp,
        activationEmail: userdata.email,
      });
    } catch (error) {
      logger.error(error, "Error in sending activation email");
      return res.status(500).json({
        success: false,
        message: "Error in sending activation email",
      });
    }
  } catch (error) {
    logger.error(error, "Error in creating user");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const LoginUser = async (req, res) => {
  try {
    logger.info("Login user endpoint hit");
    const { email, password, username } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Build the where condition based on provided credentials
    let whereCondition;
    if (email) {
      whereCondition = eq(users.email, email);
    } else if (username) {
      whereCondition = eq(users.username, username);
    } else {
      return res.status(400).json({
        success: false,
        message: "Either email or username is required",
      });
    }

    //check if user exists
    const [findUser] = await db.select().from(users).where(whereCondition);
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    //check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    //update refresh token expiry date
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //7days

    //update refresh token expiry date in database
    await db
      .update(users)
      .set({ refreshTokenExpiry: refreshTokenExpiry })
      .where(eq(users.id, findUser.id));

    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      findUser
    );

    //set cookie
    res.cookie("access_token", accessToken);
    res.cookie("refresh_token", refreshToken);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: findUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(error, "Error in logging in user");
    return res.status(500).json({
      success: false,
      message: "Error in logging in user",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    logger.info("Verify email endpoint hit");

    const { token, otp } = req.body;

    const newUser = jwt.verify(token, process.env.ACTIVATION_TOKEN_SECRET);

    if (newUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Generate refresh token expiry date
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //7days

    // Create user with refresh token data
    const [createdUser] = await db
      .insert(users)
      .values({
        ...newUser.userdata,
        isVerified: true,
        refreshTokenExpiry: refreshTokenExpiry,
      })
      .returning();

    // Generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      createdUser
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: createdUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(error, "Error in verifying email");
    return res.status(500).json({
      success: false,
      message: "Error in verifying email",
    });
  }
};

export const ResendVerificationEmail = async (req, res) => {
  try {
    logger.info("Resend verification email endpoint hit");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    //check if user exists
    const [findUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    //get activation token
    const activationToken = createActivationToken(findUser);
    const activationOtp = activationToken.otp;

    //send activation email
    await sendVerificationEmail(findUser.email, activationOtp);

    return res.status(200).json({
      success: true,
      message: "Activation email sent successfully",
    });
  } catch (error) {
    logger.error(error, "Error in resending verification email");
    return res.status(500).json({
      success: false,
      message: "Error in resending verification email",
    });
  }
};

export const ForgotPassword = async (req, res) => {
  try {
    logger.info("Forgot password endpoint hit");
  } catch (error) {}

  res.status(200).json({
    message: "Password reset email sent successfully",
  });
};

export const ResetPassword = async (req, res) => {
  try {
    logger.info("Reset password endpoint hit");
  } catch (error) {}

  res.status(200).json({
    message: "Password reset successfully",
  });
};

export const LogoutUser = async (req, res) => {
  try {
    logger.info("Logout user endpoint hit");
    const userId = req.user.id;

    //clear cookie
    res.clearCookie("access_Token");
    res.clearCookie("refresh_Token");

    //update refresh token in database
    await db
      .update(users)
      .set({
        refreshToken: null,
        isActive: false,
        lastActive: new Date(),
        refreshTokenExpiry: null,
      })
      .where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error(error, "Error in logging out user");
    return res.status(500).json({
      success: false,
      message: "Error in logging out user",
    });
  }
};

//generate username

export const generateUsername = async (req, res) => {
  try {
    logger.info("Generate username endpoint hit");
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "",
      style: "capital",
      length: 3,
    });

    //check if username already exists
    const [findUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, randomName));
    if (findUser) {
      //generate new username
      const newUsername = `${randomName}${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      return res.status(400).json({
        success: false,
        message: "Username already exists",
        username: newUsername,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Username generated successfully",
      username: randomName,
    });
  } catch (error) {
    logger.error(error, "Error in generating username");
    return res.status(500).json({
      success: false,
      message: "Error in generating username",
    });
  }
};

//get single user by id

export const getUserById = async (req, res) => {
  try {
    logger.info("Get user profile endpoint hit");
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const [getUserById] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!getUserById) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: getUserById,
    });
  } catch (error) {
    logger.error(error, "Error in getting user by id");
    return res.status(500).json({
      success: false,
      message: "Error in getting user by id",
    });
  }
};

//get all users
export const getAllUsers = async (req, res) => {
  try {
    logger.info("Get all users endpoint hit");

    const getAllUsers = await db.select().from(users);

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: getAllUsers,
      count: getAllUsers.length,
    });
  } catch (error) {
    logger.error(error, "Error in getting all users");
    return res.status(500).json({
      success: false,
      message: "Error in getting all users",
    });
  }
};


//get login user profile 

export const getUserProfile = async (req, res) => {
  try {
    logger.info("Get user profile endpoint hit");
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const [getUserProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));


      //get college location

      const collegLocation = await db.select().from(colleges).where(eq(colleges.id, getUserProfile.collegeId));

      //get post data

      const postData = await db.select().from(posts).where(eq(posts.authorId, userId));

     

      const userProfile = {
        ...getUserProfile,
        collegeLocation: collegLocation[0].location,
        collegeName: collegLocation[0].name,
        postData: postData,
        postsCount: postData.length,
      };


    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: userProfile,
    });
  } catch (error) {
    logger.error(error, "Error in getting user profile");
    return res.status(500).json({
      success: false,
      message: "Error in getting user profile",
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    logger.info("Update profile bio endpoint hit");

    const userId = req.params.id;
    const { username, avatar, bio } = req.body;

    if (!username && !avatar && !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [updatedProfile] = await db
      .update(users)
      .set({ username: username, avatar: avatar, bio: bio })
      .where(eq(users.id, userId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    logger.error(error, "Error in updating profile bio");
    return res.status(500).json({
      success: false,
      message: "Error in updating profile bio",
    });
  }
};
