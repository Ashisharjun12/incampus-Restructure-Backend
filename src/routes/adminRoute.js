
import {Router} from "express"
import {createAdmin, loginAdmin, logoutAdmin} from "../controllers/adminController.js"
import {authenticateAdmin} from "../middleware/authenticate.js"






const router = Router()

router.post("/register", createAdmin)

router.post("/login", loginAdmin)

router.post("/logout", authenticateAdmin, logoutAdmin)





export default router


