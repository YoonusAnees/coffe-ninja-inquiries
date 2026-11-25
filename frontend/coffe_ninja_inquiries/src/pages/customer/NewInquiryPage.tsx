import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useGetMeQuery } from "../../features/auth/authApi";
import { useCreateInquiryMutation } from "../../features/inquiries/inquiriesApi";

const topicTemplates = [
  { label: "Order issue", subject: "Issue with my recent order" },
  { label: "Billing or payment", subject: "Question about billing or payment" },
  { label: "Account access", subject: "Help with my account access" },
  {
    label: "Coffee & menu question",
    subject: "Question about menu or ingredients",
  },
  {
    label: "Feedback or suggestion",
    subject: "Feedback for the Coffee Ninja team",
  },
] as const;

export default function NewInquiryPage() {
  const navigate = useNavigate();
  const profile = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createInquiry, { isLoading }] = useCreateInquiryMutation();
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleTopicChange = (selectedLabel: string) => {
    setTopic(selectedLabel);
    const match = topicTemplates.find((item) => item.label === selectedLabel);
    if (match) {
      setSubject(match.subject);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if (!trimmedSubject || !trimmedDescription) {
      setErrorMessage("Enter a subject and description.");
      return;
    }

    try {
      const inquiry = await createInquiry({
        subject: trimmedSubject,
        description: trimmedDescription,
      }).unwrap();
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

  if (profile.isFetching && !profile.data) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <p role="status" className="text-sm text-[#BCD0C4]">
          Checking your session…
        </p>
      </main>
    );
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
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <div className="cf-card space-y-3">
          <p role="alert" className="text-sm text-rose-200">
            Could not check your session.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            onClick={() => void profile.refetch()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (profile.data.role !== "CUSTOMER") {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <p role="alert" className="cf-card text-sm text-rose-200">
          Only customers can submit inquiries.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <section className="cf-card space-y-5">
          <header className="space-y-1 border-b border-[#315747] pb-4">
            <h1 className="text-2xl font-semibold text-[#F5FAF7]">
              New inquiry
            </h1>
            <p className="text-sm text-[#BCD0C4]">
              Tell us what happened and our Coffee Ninja team will follow up.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
              <span>Topic helper (optional)</span>
              <select
                aria-label="Topic helper"
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="cf-input"
              >
                <option value="">Choose a topic to pre-fill subject…</option>
                {topicTemplates.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
              <div className="flex items-center justify-between gap-2">
                <span>Subject</span>
                <span className="text-xs font-normal text-[#BCD0C4]">
                  {subject.length} / 150
                </span>
              </div>
              <input
                name="subject"
                maxLength={150}
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Missing item from my order or billing question"
                className="cf-input"
              />
            </label>

            <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
              <div className="flex items-center justify-between gap-2">
                <span>Description</span>
                <span className="text-xs font-normal text-[#BCD0C4]">
                  {description.length} / 5000
                </span>
              </div>
              <textarea
                name="description"
                rows={7}
                maxLength={5000}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your description here — for example: order details, dates, what you expected, and what happened…"
                className="cf-input"
              />
            </label>

            {errorMessage && (
              <p role="alert" className="text-sm text-rose-300">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[#BCD0C4]">
                You can attach PDFs or screenshots after submitting.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="cf-btn-primary w-full sm:w-auto"
              >
                {isLoading ? "Submitting…" : "Submit inquiry"}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="cf-card space-y-2.5">
            <h2 className="text-sm font-semibold text-[#F5FAF7]">
              Tips for a faster response
            </h2>
            <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#BCD0C4]">
              <li>
                Use a short, specific subject (or pick one from the topic
                dropdown).
              </li>
              <li>
                Include relevant dates, order numbers, or steps you already
                tried.
              </li>
              <li>
                Once submitted, open the inquiry thread to attach files or
                reply.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#315747] bg-[#0B241B] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold text-[#F5FAF7]">
              What happens next
            </h2>
            <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#BCD0C4]">
              <li>Your inquiry receives a reference number immediately.</li>
              <li>A support team member is assigned to review your request.</li>
              <li>You’ll be notified in-app as soon as someone replies.</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
