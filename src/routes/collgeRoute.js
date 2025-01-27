
import {Router} from "express";
import {createCollege, getCollege, getCollegeById} from "../controllers/collegeController.js";
import { authenticateAdmin } from "../middleware/authenticate.js";

const router = Router();

router.post("/create", authenticateAdmin, createCollege);
router.get("/all", getCollege);
router.get("/:id", getCollegeById);

export default router;
