import { useState, type SyntheticEvent } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import coffeeNinjaLogo from "../../assets/coffee_ninja_logo.jpg";
import { useRegisterMutation } from "../../features/auth/authApi";

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
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const trimmedPhone = phone?.trim() ?? "";
    const password = String(formData.get("password") ?? "");

    if (!fullName || !email) {
      setErrorMessage("Enter your Full Name and Email");
      return;
    }

    if (trimmedPhone && !isValidPhoneNumber(trimmedPhone)) {
      setErrorMessage("Enter a valid phone number.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setErrorMessage("Password must be 72 bytes or fewer.");
      return;
    }

    try {
      await register({
        fullName,
        email,
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
        password,
      }).unwrap();
      navigate("/login", { replace: true });
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
              Create your inquiry account
            </h1>
            <p className="text-xs text-[#BCD0C4]">InquiryFlow</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-[#BCD0C4]"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              maxLength={150}
              required
              className="cf-input mt-1"
              placeholder="Enter Your Full Name"
            />
          </div>

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
              maxLength={254}
              required
              className="cf-input mt-1"
              placeholder="Enter Your Email"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-[#BCD0C4]"
            >
              Phone (optional)
            </label>
            <PhoneInput
              id="phone"
              international
              defaultCountry="LK"
              value={phone}
              onChange={setPhone}
              className="cf-phone-input mt-1"
              placeholder="Enter phone number"
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
              minLength={15}
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
            {isLoading ? "Creating the account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-[#BCD0C4]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
