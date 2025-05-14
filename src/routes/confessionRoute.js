import {Router} from "express"
import { createConfession, getAllConfessionRooms, getConfessionRoomByCollegeId, getsameCollegeConfessionsUsers } from "../controllers/confessionController.js"
import { authenticateUser } from "../middleware/authenticate.js"


const router = Router()

//create routes
router.get('/rooms',getAllConfessionRooms)
router.post('/create',  authenticateUser,createConfession)
router.get('/room/:collegeId',getConfessionRoomByCollegeId)
router.get('/same-college-users/:collegeId',getsameCollegeConfessionsUsers)



export default router