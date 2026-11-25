import { Navigate } from "react-router-dom";
import { useGetMeQuery } from "../../features/auth/authApi";
import { getDashboardPathForRole } from "../../config/navigation";

export default function HomeRedirect() {
  const { currentData: user, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071B14] px-6 text-[#BCD0C4]">
        <p role="status" className="text-sm">
          Loading…
        </p>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
}

