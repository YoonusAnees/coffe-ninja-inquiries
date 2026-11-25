import { Router } from "express";
import { getMyInquiries, submitInquiry, getById, getAdminInquiries, getAssinableEmployees, updatedInquiryAssignment, listAssignedInquires, showAssignedInquiry, changeAssignedInquiryStatus, reopenResolvedInquiry, closeResolvedInquiry } from "../controllers/inquiry.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";
import { add } from "../middlewares/rateLimit.mjs";


const router = Router();

router.post("/", verifyUser, rolebasedAccess("CUSTOMER"), add, submitInquiry)
router.get("/my", verifyUser, rolebasedAccess("CUSTOMER"), getMyInquiries)
router.get("/admin", verifyUser, rolebasedAccess("ADMIN"), getAdminInquiries)
router.get("/get-employee", verifyUser, rolebasedAccess("ADMIN"), getAssinableEmployees)
router.get("/assigned", verifyUser, rolebasedAccess("EMPLOYEE"), listAssignedInquires)
router.patch("/:id/reopen", verifyUser, rolebasedAccess("ADMIN"), add, reopenResolvedInquiry)
router.patch("/:id/close", verifyUser, rolebasedAccess("ADMIN"), add, closeResolvedInquiry)
router.patch("/assigned/:id/status", verifyUser, rolebasedAccess("EMPLOYEE"), add, changeAssignedInquiryStatus)
router.get("/assigned/:id", verifyUser, rolebasedAccess("EMPLOYEE"), showAssignedInquiry)
router.patch("/assigned/:id/status", verifyUser, rolebasedAccess("EMPLOYEE"), add, changeAssignedInquiryStatus)
router.patch("/:id/assignment", verifyUser, rolebasedAccess("ADMIN"), add, updatedInquiryAssignment)
router.get("/:id", verifyUser, rolebasedAccess("CUSTOMER"), getById)


export default router;