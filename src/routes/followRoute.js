import { Router } from "express";
import { followUser,unfollowUser,getFollowStatus } from "../controllers/followController.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = Router();

router.post("/:id", authenticateUser,followUser);
router.post("/unfollow/:id", authenticateUser,unfollowUser);
router.get("/:id", authenticateUser,getFollowStatus);

export default router;