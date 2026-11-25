import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** Password field with an accessible visibility toggle button. */
export default function PasswordInput({
  className = "",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`cf-input pr-10 ${className}`.trim()}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#BCD0C4] transition hover:text-[#F5FAF7] focus:outline-none focus-visible:text-[#6EE7A5]"
      >
        {visible ? (
          <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeIcon className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

