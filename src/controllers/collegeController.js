import logger from "../utils/logger.js";
import { db } from "../config/database.js";
import { colleges } from "../models/College.js";
import { confessionRoom } from "../models/Confession.js";
import { eq } from "drizzle-orm";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createCollege = async (req, res) => {
  try {
    logger.info("College creation route hit...");

    const { name, location  } = req.body;

    //get admin id from admin middleware
    const adminId = req.admin.id;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload logo

    let logoUrl = null;
    if (req.files?.logo) {
      const logoFile = req.files.logo[0];
      try {
        const uploadResponse = await uploadOnCloudinary(logoFile.path);
        if (uploadResponse) {
          logoUrl = {
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
          };
        }
      } catch (error) {
        logger.error("Error uploading logo:", error);
        // Continue without logo instead of failing
      }
    }

    //check if college already exists
    const collegeExists = await db
      .select()
      .from(colleges)
      .where(eq(colleges.name, name));
    if (collegeExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "College already exists",
      });
    }

    //create college
    const [newCollege] = await db
      .insert(colleges)
      .values({
        name,
        location,
        logo: logoUrl ? [logoUrl] : [],
        createdById: adminId,
      })
      .returning();

    //create confession room
    const [newConfessionRoom] = await db
      .insert(confessionRoom)
      .values({
        collegeId: newCollege.id,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "College created successfully",
      data: {
        college: newCollege,
        confessionRoom: newConfessionRoom,
      },
    });
  } catch (error) {
    logger.error(error, "Error in creating college");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCollege = async (req, res) => {
  try {
    logger.info("Update college route hit...");

    const { id } = req.params;
    const { name, location } = req.body;

    if (!name && !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [updatedCollege] = await db
      .update(colleges)
      .set({
        name,
        location,
      })
      .where(eq(colleges.id, id))
      .returning();

    return res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: updatedCollege,
    });
  } catch (error) {
    logger.error(error, "Error in updating college");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCollegeById = async (req, res) => {
  try {
    logger.info("Delete college route hit...");

    const { id } = req.params;

    await db.delete(colleges).where(eq(colleges.id, id));

    return res.status(200).json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error) {
    logger.error(error, "Error in deleting college");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCollege = async (req, res) => {
  try {
    logger.info("Get college route hit...");

    const findAllCollges = await db.select().from(colleges);

    return res.json({
      success: true,
      message: "College fetched successfully",
      data: findAllCollges,
    });
  } catch (error) {
    logger.error(error, "Error in getting college");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    logger.info("Get college by id route hit...");

    const { id } = req.params;

    const findCollegeById = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, id));

    return res.json({
      success: true,
      message: "College fetched successfully",
      data: findCollegeById,
    });
  } catch (error) {
    logger.error(error, "Error in getting college by id");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
