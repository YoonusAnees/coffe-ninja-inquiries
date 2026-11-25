import { Navigate, Outlet } from "react-router-dom";
import { useGetMeQuery } from "../../features/auth/authApi";
import { getDashboardPathForRole, type UserRole } from "../../config/navigation";

export default function RoleGuard({
  allowedRoles,
}: {
  allowedRoles: UserRole[];
}) {
  const { currentData: user, isLoading } = useGetMeQuery();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

