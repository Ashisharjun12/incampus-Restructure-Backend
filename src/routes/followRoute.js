import { Router } from "express";
import { followUser,unfollowUser,getFollowStatus, getFollowingUsers, getFollowerUsers } from "../controllers/followController.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = Router();

router.post("/:id", authenticateUser,followUser);
router.post("/unfollow/:id", authenticateUser,unfollowUser);
router.get("/:id", authenticateUser,getFollowStatus);

//get follwing users
router.get("/follower/:id", getFollowingUsers)
router.get("/following/:id", getFollowerUsers)



export default router;