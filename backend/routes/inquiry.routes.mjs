import { Router } from "express";
import { submitInquiry } from "../controllers/inquiry.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";

const router = Router();

router.post("/", verifyUser, rolebasedAccess("CUSTOMER"), submitInquiry)

export default router;