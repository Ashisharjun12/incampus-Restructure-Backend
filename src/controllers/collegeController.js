import logger from "../utils/logger.js"
import {db} from "../utils/database.js"
import {colleges} from "../models/College.js"


export const createCollege = async (req, res) => {
    try {
        logger.info("College creation route hit...");
        const {name, location} = req.body;

        if(!name || !location) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });

        }

        const collegeExists = await db.select().from(colleges).where(eq(colleges.name, name));
        if(collegeExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: "College already exists",
            });
        }

        //create college
        const newCollege = await db.insert(colleges).values({
            name,
            location,
        });
        return res.status(201).json({
            success: true,
            message: "College created successfully",
            data: newCollege,
        });
        
    } catch (error) {
        logger.error(error, "Error in creating college");
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
