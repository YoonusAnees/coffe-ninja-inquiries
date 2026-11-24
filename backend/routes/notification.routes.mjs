import { Router } from "express";

import { listMyNotifications, markNotificationRead } from "../controllers/notification.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";

const router = Router();

router.get("/", verifyUser, listMyNotifications);
router.patch("/:id/read", verifyUser, markNotificationRead);

export default router;