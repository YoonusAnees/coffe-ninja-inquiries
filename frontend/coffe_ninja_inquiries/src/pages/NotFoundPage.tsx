import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071B14] px-4 py-16 text-[#F5FAF7]">
      <div className="cf-card max-w-md space-y-4">
        <p className="text-sm font-semibold text-[#6EE7A5]">404</p>
        <h1 className="text-3xl font-semibold text-[#F5FAF7]">
          Page not found
        </h1>
        <p className="text-sm text-[#BCD0C4]">
          The link may be incorrect, or the page may have moved.
        </p>
        <Link to="/" className="cf-btn-primary">
          Go to home
        </Link>
      </div>
    </main>
  );
}
