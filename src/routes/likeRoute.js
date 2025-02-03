import {Router} from "express"
import {likePost, unlikePost, fetchLikeForPost, addLikeToComment, removeLikeFromComment, fetchLikeForComment} from "../controllers/likeController.js"
import { authenticateUser } from "../middleware/authenticate.js"
const router = Router()

//post like routes

router.post("/post/:postId", authenticateUser, likePost)  
router.delete("/post/unlike/:postId", authenticateUser, unlikePost)
router.get("/post/:postId", fetchLikeForPost)

//comment like routes

router.post("/comment/:commentId", authenticateUser, addLikeToComment)
router.delete("/comment/unlike/:commentId", authenticateUser, removeLikeFromComment)
router.get("/comment/:commentId", fetchLikeForComment)

export default router