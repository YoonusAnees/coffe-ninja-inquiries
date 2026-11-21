import { Router } from "express";
import { login, logout, myProfile, register } from "../controllers/auth.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout)
router.get('/profile', verifyUser, myProfile)

export default router;