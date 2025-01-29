
import {Router} from "express";
import {createCollege, getCollege, getCollegeById, updateCollege, deleteCollegeById} from "../controllers/collegeController.js";
import { authenticateAdmin } from "../middleware/authenticate.js";

const router = Router();

router.post("/create", authenticateAdmin, createCollege);
router.get("/all", getCollege);
router.get("/:id", getCollegeById);
router.put("/update/:id", authenticateAdmin, updateCollege);
router.delete("/delete/:id", authenticateAdmin, deleteCollegeById);

export default router;
