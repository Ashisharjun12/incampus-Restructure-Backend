import { Router } from 'express';
import {addComment, editComment, deleteComment, getSingleComment, getAllCommentsForPost} from "../controllers/commentController.js"
import {authenticateUser} from "../middleware/authenticate.js"


const router = Router()

router.post("/:postId", authenticateUser, addComment)
router.put("/:commentId", authenticateUser, editComment)
router.delete("/:commentId", authenticateUser, deleteComment)
router.get("/:commentId",  getSingleComment)
router.get("/post/:postId", getAllCommentsForPost)




export default router;