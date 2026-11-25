import { Navigate } from "react-router-dom";
import { getDashboardPathForRole } from "../../config/navigation";
import { useGetMeQuery } from "../../features/auth/authApi";
import { CenteredSpinner } from "../ui/LoadingState";

export default function HomeRedirect() {
  const { currentData: user, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return <CenteredSpinner fullScreen label="Loading…" />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
}

