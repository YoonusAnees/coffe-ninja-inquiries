import { Router } from "express";
import { getMyInquiries, submitInquiry, getById, getAdminInquiries, getAssinableEmployees, updatedInquiryAssignment, listAssignedInquires, showAssignedInquiry, changeAssignedInquiryStatus, reopenResolvedInquiry } from "../controllers/inquiry.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";

const router = Router();

router.post("/", verifyUser, rolebasedAccess("CUSTOMER"), submitInquiry)
router.get("/my", verifyUser, rolebasedAccess("CUSTOMER"), getMyInquiries)
router.get("/admin", verifyUser, rolebasedAccess("ADMIN"), getAdminInquiries)
router.get("/get-employee", verifyUser, rolebasedAccess("ADMIN"), getAssinableEmployees)
router.get("/assigned", verifyUser, rolebasedAccess("EMPLOYEE"), listAssignedInquires)
router.patch("/:id/reopen", verifyUser, rolebasedAccess("ADMIN"), reopenResolvedInquiry)
router.patch("/assigned/:id/status", verifyUser, rolebasedAccess("EMPLOYEE"), changeAssignedInquiryStatus)
router.get("/assigned/:id", verifyUser, rolebasedAccess("EMPLOYEE"), showAssignedInquiry)
router.patch("/:id/assignment", verifyUser, rolebasedAccess("ADMIN"), updatedInquiryAssignment)
router.get("/:id", verifyUser, rolebasedAccess("CUSTOMER"), getById)


export default router;