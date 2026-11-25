import { getEmployeeWorkload ,getInquiryStatusReport} from "../services/report.service.mjs";

export const employeeWorkloadReport = async (req, res, next) => {
    try {
        const employees = await getEmployeeWorkload(req.user);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Employee workload fetched.",
            data: { employees },
        });
    } catch (error) {
        return next(error);
    }
};

export const inquiryStatusReport = async (req, res, next) => {
  try {
    const report = await getInquiryStatusReport(req.user);

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "Inquiry status report fetched.",
      data: report,
    });
  } catch (error) {
    return next(error);
  }
};