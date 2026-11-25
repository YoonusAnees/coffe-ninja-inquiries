import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useGetMeQuery } from "../../features/auth/authApi";
import { useCreateInquiryMutation } from "../../features/inquiries/inquiriesApi";

const inputClass = "mt-1 block w-full rounded border px-3 py-2";

export default function NewInquiryPage() {
  const navigate = useNavigate();
  const profile = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createInquiry, { isLoading }] = useCreateInquiryMutation();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    if (!subject || !description) {
      setErrorMessage("Enter a subject and description.");
      return;
    }

    try {
      const inquiry = await createInquiry({ subject, description }).unwrap();
      navigate(`/inquiries/${inquiry.id}`, { replace: true });
    } catch (error) {
      const apiError = error as {
        status?: unknown;
        data?: { message?: unknown };
      };

      if (apiError?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const message = apiError?.data?.message;

      if (typeof message === "string" && message.trim()) {
        setErrorMessage(message);
        return;
      }

      setErrorMessage("Unable to submit your inquiry. Please try again.");
    }
  };

  if (profile.isFetching) {
    return <p role="status">Checking your session…</p>;
  }

  if (
    profile.error &&
    "status" in profile.error &&
    profile.error.status === 401
  ) {
    return <Navigate to="/login" replace />;
  }

  if (profile.error || !profile.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-12">
        <p role="alert">Could not check your session.</p>
        <button type="button" onClick={() => void profile.refetch()}>
          Try again
        </button>
      </main>
    );
  }

  if (profile.data.role !== "CUSTOMER") {
    return <p role="alert">Only customers can submit inquiries.</p>;
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link to="/inquiries" className="underline">
        Back to My Inquiries
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">New inquiry</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          Subject
          <input
            name="subject"
            maxLength={150}
            required
            className={inputClass}
          />
        </label>

        <label className="block">
          Description
          <textarea
            name="description"
            rows={6}
            maxLength={5000}
            required
            className={inputClass}
          />
        </label>

        {errorMessage && (
          <p role="alert" className="text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Submitting…" : "Submit inquiry"}
        </button>
      </form>
    </main>
  );
}
