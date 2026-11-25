import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-lg space-y-4 px-6 py-16">
      <p className="text-sm text-slate-600">404</p>

      <h1 className="text-3xl font-semibold">Page not found</h1>

      <p>The link may be incorrect, or the page may have moved.</p>

      <Link className="inline-block underline" to="/">
        Go to home
      </Link>
    </main>
  );
}
