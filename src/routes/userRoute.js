import {Router} from "express";
import { RegisterUser, LoginUser, verifyEmail, ResendVerificationEmail, ForgotPassword, ResetPassword, LogoutUser, generateUsername, getUserProfile } from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authenticate.js";


const router = Router();

router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", ResendVerificationEmail);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.post("/logout",authenticateUser ,LogoutUser);
router.get("/generate-username", generateUsername);
router.get("/profile", authenticateUser ,getUserProfile);


export default router;