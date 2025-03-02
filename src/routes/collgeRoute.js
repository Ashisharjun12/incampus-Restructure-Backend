import { Router } from "express";
import {
  createCollege,
  getCollege,
  getCollegeById,
  updateCollege,
  deleteCollegeById,
} from "../controllers/collegeController.js";
import { authenticateAdmin } from "../middleware/authenticate.js";
import { upload } from "../utils/multer.js";

const router = Router();

router.post(
  "/create",
  authenticateAdmin,
  upload.fields([{ name: 'logo', maxCount: 1 }]),
  createCollege
);
router.get("/all", getCollege);
router.get("/:id", getCollegeById);
router.put("/update/:id", authenticateAdmin, updateCollege);
router.delete("/delete/:id", authenticateAdmin, deleteCollegeById);

export default router;
