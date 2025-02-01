import {Router} from "express"
import {likePost, unlikePost, fetchLikeForPost} from "../controllers/likeController.js"
import { authenticateUser } from "../middleware/authenticate.js"
const router = Router()

router.post("/:postId", authenticateUser, likePost)  
router.delete("/unlike/:postId", authenticateUser, unlikePost)
router.get("/:postId", fetchLikeForPost)

export default router