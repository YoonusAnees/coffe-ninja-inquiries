import { useState, type SyntheticEvent } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import coffeeNinjaLogo from "../../assets/coffee_ninja_logo.jpg";
import PasswordInput from "../../components/ui/PasswordInput";
import { useRegisterMutation } from "../../features/auth/authApi";

type RegisterFields = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FieldName = keyof RegisterFields;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getApiErrorMessage(error: unknown): string {
  const apiError = error as { data?: { message?: unknown } };
  const message = apiError?.data?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Unable to create your account. Please try again.";
}

function validateRegisterFields(fields: RegisterFields): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = fields.fullName.trim();
  const trimmedEmail = fields.email.trim();
  const trimmedPhone = fields.phone.trim();

  if (!trimmedName) {
    errors.fullName = "Enter your full name.";
  }

  if (!trimmedEmail) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (trimmedPhone && !isValidPhoneNumber(trimmedPhone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!fields.password) {
    errors.password = "Enter a password.";
  } else if (fields.password.length < 15) {
    errors.password = "Password must be at least 15 characters.";
  } else if (new TextEncoder().encode(fields.password).length > 72) {
    errors.password = "Password must be 72 bytes or fewer.";
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const fieldErrors = validateRegisterFields({
    fullName,
    email,
    phone: phone ?? "",
    password,
    confirmPassword,
  });

  const getVisibleError = (field: FieldName): string | undefined =>
    submitted || touched[field] ? fieldErrors[field] : undefined;

  const markTouched = (field: FieldName) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const trimmedPhone = phone?.trim() ?? "";

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
        password,
      }).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  const fullNameError = getVisibleError("fullName");
  const emailError = getVisibleError("email");
  const phoneError = getVisibleError("phone");
  const passwordError = getVisibleError("password");
  const confirmPasswordError = getVisibleError("confirmPassword");

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

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
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
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                markTouched("fullName");
              }}
              onBlur={() => markTouched("fullName")}
              aria-invalid={Boolean(fullNameError)}
              aria-describedby={fullNameError ? "fullName-error" : undefined}
              className="cf-input mt-1"
              placeholder="Enter Your Full Name"
            />
            {fullNameError && (
              <p id="fullName-error" role="alert" className="mt-1 text-xs text-rose-300">
                {fullNameError}
              </p>
            )}
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value) markTouched("email");
              }}
              onBlur={() => markTouched("email")}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              className="cf-input mt-1"
              placeholder="Enter Your Email"
            />
            {emailError && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-rose-300">
                {emailError}
              </p>
            )}
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
              onChange={(val) => {
                setPhone(val);
                if (val) markTouched("phone");
              }}
              onBlur={() => markTouched("phone")}
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? "phone-error" : undefined}
              className="cf-phone-input mt-1"
              placeholder="Enter phone number"
            />
            {phoneError && (
              <p id="phone-error" role="alert" className="mt-1 text-xs text-rose-300">
                {phoneError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#BCD0C4]"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              minLength={15}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value) markTouched("password");
              }}
              onBlur={() => markTouched("password")}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              placeholder="Enter Your Password"
            />
            {passwordError && (
              <p id="password-error" role="alert" className="mt-1 text-xs text-rose-300">
                {passwordError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#BCD0C4]"
            >
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              minLength={15}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (e.target.value) markTouched("confirmPassword");
              }}
              onBlur={() => markTouched("confirmPassword")}
              aria-invalid={Boolean(confirmPasswordError)}
              aria-describedby={
                confirmPasswordError ? "confirmPassword-error" : undefined
              }
              placeholder="Confirm Your Password"
            />
            {confirmPasswordError && (
              <p
                id="confirmPassword-error"
                role="alert"
                className="mt-1 text-xs text-rose-300"
              >
                {confirmPasswordError}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-rose-300">
              {serverError}
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
