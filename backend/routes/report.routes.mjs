import { Router } from "express";

import { employeeWorkloadReport, inquiryStatusReport } from "../controllers/report.controller.mjs";
import { verifyUser } from "../middlewares/authenticate.mjs";
import { rolebasedAccess } from "../middlewares/authorize.mjs";

const router = Router();

router.get(
    "/employee-workload",
    verifyUser,
    rolebasedAccess("ADMIN"),
    employeeWorkloadReport,
);

router.get(
    "/inquiry-status",
    verifyUser,
    rolebasedAccess("ADMIN"),
    inquiryStatusReport,
);

export default router;