import { Router } from "express";

import { employeeWorkloadReport, inquiryStatusReport } from "../controllers/report.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";
import { add } from "../middlewares/rateLimit.mjs";


const router = Router();

router.get(
    "/employee-workload",
    verifyUser,
    rolebasedAccess("ADMIN"),
    add,
    employeeWorkloadReport,
);

router.get(
    "/inquiry-status",
    verifyUser,
    rolebasedAccess("ADMIN"),
    add,
    inquiryStatusReport,
);

export default router;