import { useState, type SyntheticEvent } from "react";
import { useLoginMutation } from "../../features/auth/authApi";
import { useNavigate } from "react-router-dom";

function getErrorMessage(error: unknown): string {
  const err = error as { data?: { message?: string } };
  return err?.data?.message || "Unable to Sign In. Please Try Again";
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
      await login({ email, password }).unwrap();
      navigate("/account", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <main className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-semibold">Sign In to Coffe Ninja</h1>
      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            // autoComplete="email"
            maxLength={254}
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            // autoComplete="email"
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50 "
        >
          {" "}
          {isLoading ? "Signing in......" : "Sign In"}
        </button>
      </form>

      <p>
        No account?
        <a href="/register" className="text-blue-600 ml-1">
          Create an account
        </a>
      </p>
    </main>
  );
}
