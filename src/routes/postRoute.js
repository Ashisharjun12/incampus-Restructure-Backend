import { Router } from "express";
import { createPost , getAllPosts, getPostById, getPostByAuthorId, deletePostById, getPostByUserId, updatePostById} from "../controllers/postController.js";
import { authenticateUser } from "../middleware/authenticate.js";
import { upload } from "../utils/multer.js";


const router = Router();

//post routes
router.post("/create", authenticateUser, upload.array("media"), createPost);
router.get("/get-all", getAllPosts);
router.get("/get-post/:id", getPostById);
router.get("/get-post-by-author/:id", getPostByAuthorId);
router.delete("/delete/:id", deletePostById);

//user post routes
router.get("/get-post-by-author/:id", authenticateUser, getPostByUserId);
router.put("/update/:id", authenticateUser, updatePostById);




export default router;
