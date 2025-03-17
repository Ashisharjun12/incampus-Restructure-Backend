import {Router} from "express"
import { createConfession, getAllConfessionRooms } from "../controllers/confessionController.js"
import { authenticateUser } from "../middleware/authenticate.js"


const router = Router()

//create routes
router.get('/rooms',getAllConfessionRooms)
router.post('/create',  authenticateUser,createConfession)



export default router