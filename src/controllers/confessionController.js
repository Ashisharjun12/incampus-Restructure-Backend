import logger from "../utils/logger.js";
import { users } from "../models/User.js";
import { follows } from "../models/Follow.js";
import { db } from "../config/database.js";
import { and, eq, sql } from "drizzle-orm";
import { colleges } from "../models/College.js";
import { confessionRoom } from "../models/Confession.js";

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


export const getConfessionRoomByCollegeId = async(req,res)=>{
  try {
    logger.info("getting confession room by college college id");

    const {collegeId} = req.params;

    const confessionRoomData = await db.select().from(confessionRoom).where(eq(confessionRoom.collegeId,collegeId))
    const collegeData = await db.select().from(colleges).where(eq(colleges.id,collegeId))

    return res.status(200).json({
      message: "get confession room by college id",
      confessionRoom: confessionRoomData,
      collegeName: collegeData.map((room) => room.name),
      collegeLocation: collegeData.map((room) => room.location),
      collegeLogo:collegeData.map((room) => room.logo)

    })

  } catch (error) {
    logger.error(error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAllConfessionRooms = async(req,res)=>{
  try {
    logger.info("getting all confession rooms");

    const college = await db.select().from(colleges)

    const getAllConfessionRooms = await db.select().from(confessionRoom)


    return res.status(200).json({
      message: "get All ConfessionRooms",
      confessionRooms: getAllConfessionRooms,
      collegeName: college.map((room) => room.name),
      collegeLocation: college.map((room) => room.location),
      collegeLogo:college.map((room) => room.logo)
    })
    
  } catch (error) {
    logger.error(error.stack);
    res.status(500).json({ message: "Internal Server Error" });
    
  }

}


export const getsameCollegeConfessionsUsers=async(req,res)=>{
  try {
    logger.info("getting same college confessions users");
    const {collegeId} = req.params;

    const sameCollegeConfessionsUsers = await db.select().from(users).where(eq(users.collegeId,collegeId))

    return res.status(200).json({
        message: "get same college confessions users",
        sameCollegeConfessionsUsers: sameCollegeConfessionsUsers
    })

  } catch (error) {
    logger.error(error.stack);
    res.status(500).json({ message: "Internal Server Error" });
    
  }
}
