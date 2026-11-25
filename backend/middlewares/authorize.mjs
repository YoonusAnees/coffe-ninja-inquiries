import AppError from "../utils/AppError.mjs";

export const rolebasedAccess = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("PleaseSign In", 401))
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError("No Permission", 401));
        }
        return next();
    }
}