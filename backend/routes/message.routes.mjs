import { Router } from "express";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";
import {
    customerSend,
    employeeAddNote,
    employeeSendReply,
    getCustomerReplies,
    getEmployeeNotes,
    getEmployeeOwnMessages,
} from "../controllers/message.controller.mjs";

const router = Router();

// Customer public replies
router.post("/:id/replies", verifyUser, rolebasedAccess("CUSTOMER"), customerSend);
router.get("/:id/replies", verifyUser, rolebasedAccess("CUSTOMER"), getCustomerReplies);

// Employee public replies
router.post("/assigned/:id/replies", verifyUser, rolebasedAccess("EMPLOYEE"), employeeSendReply);
router.get("/assigned/:id/replies", verifyUser, rolebasedAccess("EMPLOYEE"), getEmployeeOwnMessages);

// Employee internal notes
router.get("/assigned/:id/notes", verifyUser, rolebasedAccess("EMPLOYEE"), getEmployeeNotes);
router.post("/assigned/:id/notes", verifyUser, rolebasedAccess("EMPLOYEE"), employeeAddNote);

export default router;