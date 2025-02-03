
import {Router} from "express";
import { addReply, editReply, deleteReply, getAllRepliesForComment } from "../controllers/replyController.js";
import {authenticateUser } from "../middleware/authenticate.js";

const router = Router();


router.post("/addReply/:commentId", authenticateUser, addReply);
router.put("/editReply/:replyId", authenticateUser, editReply);
router.delete("/deleteReply/:replyId", authenticateUser, deleteReply);
router.get("/getAll/:commentId", getAllRepliesForComment);

export default router;
    