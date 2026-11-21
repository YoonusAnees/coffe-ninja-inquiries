import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGetMeQuery, useLogoutMutation } from "../../features/auth/authApi";

export default function AccountPage() {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const {
    data: user,
    error,
    isFetching,
    refetch,
  } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await logout().unwrap();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    }
  };

  if (isFetching) {
    return <p role="status">Verifying</p>;
  }

  if (error && "status" in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (error || !user) {
    return (
      <main className="mx-auto max-w-sm px-6 py-12">
        <p role="status">Could Not Verify</p>
        <button type="button" onClick={() => void refetch()}>
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-semibold">Your Account</h1>

      <p className="mt-4">Full Name: {user.fullName}</p>
      <p className="mt-4">Email: {user.email}</p>
      <p className="mt-4">Role: {user.role}</p>

      {logoutError && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {logoutError}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isLoggingOut}
        className="mt-6 w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoggingOut ? "Signing out..." : "Sign Out"}
      </button>
    </main>
  );
}
