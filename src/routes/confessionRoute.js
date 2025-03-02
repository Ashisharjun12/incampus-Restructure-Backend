import {Router} from "express"
import { createConfession } from "../controllers/confessionController.js"
import { authenticateUser } from "../middleware/authenticate.js"


const router = Router()

//create routes

router.post('/create',  authenticateUser,createConfession)



export default router