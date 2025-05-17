
import {Router} from "express"
import { AccountDeleteUser, createAdmin, getAccountDeleteReq, loginAdmin, logoutAdmin} from "../controllers/adminController.js"
import {authenticateAdmin} from "../middleware/authenticate.js"


const router = Router()

router.post("/register", createAdmin)
router.post("/login", loginAdmin)
router.post("/logout", authenticateAdmin, logoutAdmin)
router.get("/account-delete-req",authenticateAdmin,getAccountDeleteReq)
router.post("/delete-account/:id",authenticateAdmin,AccountDeleteUser)

export default router


