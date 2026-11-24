import { Router } from "express";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";
import { CustomerSendReply, getCustomerReplies } from "../controllers/message.controller.mjs";

const router = Router();

router.post("/assigned/:id/replies", verifyUser, rolebasedAccess("EMPLOYEE"), CustomerSendReply)
router.get("/:id/replies", verifyUser, rolebasedAccess("CUSTOMER"), getCustomerReplies)

export default router;