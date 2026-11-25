import { Navigate } from "react-router-dom";
import { UserIcon } from "../../components/ui/Icons";
import { CenteredSpinner } from "../../components/ui/LoadingState";
import { useGetMeQuery } from "../../features/auth/authApi";

export default function AccountPage() {
  const {
    data: user,
    error,
    isFetching,
    refetch,
  } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isFetching && !user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <CenteredSpinner label="Verifying…" />
      </main>
    );
  }

  if (error && "status" in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (error || !user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <div className="cf-card space-y-3">
          <p role="status" className="text-sm text-rose-200">
            Could not verify your account.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6 mt-10 md:mt-0">
      <section className="cf-card space-y-4 sm:space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#315747] pb-4 sm:gap-4 sm:pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#315747] bg-[#0B241B] text-[#6EE7A5] sm:h-12 sm:w-12">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-[#F5FAF7] sm:text-2xl">
                {user.fullName || "Your Account"}
              </h1>
              <p className="truncate text-xs text-[#BCD0C4] sm:text-sm">
                {user.email}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full border border-[#6EE7A5]/45 bg-[#17603F]/50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#6EE7A5] sm:px-3 sm:py-1">
            {user.role}
          </span>
        </header>

        <dl className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-lg border border-[#315747] bg-[#071B14] p-3 sm:p-4">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[#BCD0C4] sm:text-xs">
              Full Name
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#F5FAF7]">
              {user.fullName || "—"}
            </dd>
          </div>

          <div className="rounded-lg border border-[#315747] bg-[#071B14] p-3 sm:p-4">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[#BCD0C4] sm:text-xs">
              Email
            </dt>
            <dd className="mt-1 break-all text-sm font-semibold text-[#F5FAF7]">
              {user.email}
            </dd>
          </div>

          <div className="rounded-lg border border-[#315747] bg-[#071B14] p-3 sm:p-4">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[#BCD0C4] sm:text-xs">
              Account Role
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#F5FAF7]">
              {user.role}
            </dd>
          </div>

          <div className="rounded-lg border border-[#315747] bg-[#071B14] p-3 sm:p-4">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[#BCD0C4] sm:text-xs">
              Session Status
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#6EE7A5]">
              Signed in
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
