import { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostByAuthorId,
  deletePostById,
  getPostByUserId,
  updatePostById,
  savePost,
} from "../controllers/postController.js";
import { authenticateUser } from "../middleware/authenticate.js";
import { s3Upload } from "../utils/multer.js";

const router = Router();

//post routes
router.post("/create", authenticateUser, s3Upload.array("media"), createPost);
router.get("/get-all", getAllPosts);
router.get("/get-post/:id", getPostById);
router.get("/get-post-by-author/:id", getPostByAuthorId);
router.delete("/delete/:id", authenticateUser, deletePostById);


router.get("/user-posts/:id", authenticateUser, getPostByUserId);
router.put("/update/:id", authenticateUser, updatePostById);

//save post
router.post("/:id/save", authenticateUser, savePost);

export default router;
