import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import coffeeNinjaLogo from "../../assets/coffee_ninja_logo.jpg";
import { getDashboardPathForRole } from "../../config/navigation";
import { useLoginMutation } from "../../features/auth/authApi";

function getErrorMessage(error: unknown): string {
  const err = error as { data?: { message?: string } };
  return err?.data?.message || "Unable to sign in. Please try again.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const user = await login({ email, password }).unwrap();
      navigate(getDashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071B14] px-4 py-12 text-[#F5FAF7]">
      <div className="cf-card w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3">
          <img
            src={coffeeNinjaLogo}
            alt="Coffee Ninja"
            className="h-10 w-10 rounded-lg border border-[#315747] object-cover"
          />
          <div>
            <h1 className="text-xl font-semibold text-[#F5FAF7]">
              Sign in to Coffee Ninja
            </h1>
            <p className="text-xs text-[#BCD0C4]">InquiryFlow</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#BCD0C4]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              required
              className="cf-input mt-1"
              placeholder="Enter Your Email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#BCD0C4]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              className="cf-input mt-1"
              placeholder="Enter Your Password"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-rose-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="cf-btn-primary w-full"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-[#BCD0C4]">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
