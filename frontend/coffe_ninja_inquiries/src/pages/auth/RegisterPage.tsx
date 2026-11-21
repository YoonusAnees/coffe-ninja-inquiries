import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../features/auth/authApi";
import { useState, type SyntheticEvent } from "react";

function getErrorMessage(error: unknown): string {
  const apiError = error as { data?: { message?: unknown } };
  const message = apiError?.data?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Unable to create your account. Please try again.";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const input = "mt-1 block w-full rounded border px-3 py-2";

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName"));
    const email = String(formData.get("email"));
    const phone = String(formData.get("phone"));
    const password = String(formData.get("password"));

    if (!fullName || !email) {
      setErrorMessage("Enter your Full Name and Email");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setErrorMessage("Password must be 72 bytes or fewer.");
      return;
    }

    try {
      await register({ fullName, email, phone, password }).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };
  return (
    <main className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-semibold">Create your Inquiry Account </h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            maxLength={150}
            required
            className={input}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            maxLength={254}
            required
            className={input}
          />
        </div>

        <div>
          <label htmlFor="phone">Phone </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            minLength={10}
            className={input}
          />
        </div>

        <div>
          <label htmlFor="password">Password </label>
          <input
            type="password"
            id="password"
            name="password"
            maxLength={15}
            required
            placeholder="Use atleast 15 Characters"
            className={input}
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
          className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Creating the account..." : "Create Account"}
        </button>
      </form>
    </main>
  );
}
