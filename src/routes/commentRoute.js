import { Router } from 'express';
import {addComment} from "../controllers/commentController.js"
import {authenticateUser} from "../middleware/authenticate.js"


const router = Router()

router.post("/:postId", authenticateUser, addComment)



export default router;