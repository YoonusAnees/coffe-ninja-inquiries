import { Router } from "express";
import { getMyInquiries, submitInquiry, getById, getAdminInquiries } from "../controllers/inquiry.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";

const router = Router();

router.post("/", verifyUser, rolebasedAccess("CUSTOMER"), submitInquiry)
router.get("/my", verifyUser, rolebasedAccess("CUSTOMER"), getMyInquiries)
router.get("/admin", verifyUser, rolebasedAccess("ADMIN"), getAdminInquiries)
router.get("/:id", verifyUser, rolebasedAccess("CUSTOMER"), getById)


export default router;