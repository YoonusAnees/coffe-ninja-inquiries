import { Router } from "express";
import { login, logout, myProfile, register, getAllCustomer } from "../controllers/auth.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout)
router.get('/profile', verifyUser, myProfile)
router.get("/get-all-customers", verifyUser, rolebasedAccess("ADMIN"), getAllCustomer);

export default router;