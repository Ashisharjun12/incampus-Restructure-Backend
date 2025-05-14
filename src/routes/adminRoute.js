
import {Router} from "express"
import { AccountDeleteUser, createAdmin, loginAdmin, logoutAdmin} from "../controllers/adminController.js"
import {authenticateAdmin} from "../middleware/authenticate.js"






const router = Router()

router.post("/register", createAdmin)

router.post("/login", loginAdmin)

router.post("/logout", authenticateAdmin, logoutAdmin)
router.get("/account-delete-req",authenticateAdmin)
router.post("/delete/:id",authenticateAdmin,AccountDeleteUser)





export default router


