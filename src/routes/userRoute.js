import { Router } from "express";
import {
  RegisterUser,
  LoginUser,
  verifyEmail,
  ResendVerificationEmail,
  ForgotPassword,
  ResetPassword,
  LogoutUser,
  generateUsername,
  getUserById,
  getAllUsers,
  getUserProfile,
  updateProfile,
} from "../controllers/userController.js";
import { searchUser, mutualCollegeFriends } from "../queries/userQuery.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = Router();

//auth routes
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", ResendVerificationEmail);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.post("/logout", authenticateUser, LogoutUser);
router.get("/generate-username", generateUsername);

//queries
router.get("/search", authenticateUser, searchUser);
router.get("/profile/:id", authenticateUser, getUserProfile);
router.put("/update-profile/:id", authenticateUser, updateProfile);
router.get("/mutual-college-friends", authenticateUser, mutualCollegeFriends);





router.get("/all", getAllUsers);
router.get("/:id", getUserById);




export default router;
