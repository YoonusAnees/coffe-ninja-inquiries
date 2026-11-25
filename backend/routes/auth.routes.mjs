import { Router } from "express";
import { login, logout, myProfile, register, getAllCustomer, getAllEmployee, updateEmployeeStatus } from "../controllers/auth.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";
import { loginLimiter, registerLimiter, } from "../middlewares/rateLimit.mjs";


const router = Router();

router.post("/register", loginLimiter, register);
router.post("/login", registerLimiter, login);
router.post("/logout", logout)
router.get('/profile', verifyUser, myProfile)
router.get("/get-all-customers", verifyUser, rolebasedAccess("ADMIN"), getAllCustomer);
router.get("/get-all-employees", verifyUser, rolebasedAccess("ADMIN"), getAllEmployee);
router.patch("/employees/:id/status", verifyUser, rolebasedAccess("ADMIN"), updateEmployeeStatus);

export default router;