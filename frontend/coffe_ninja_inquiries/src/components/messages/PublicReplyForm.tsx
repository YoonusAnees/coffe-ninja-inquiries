import { useState } from "react";
import type { FormEvent } from "react";

import {
  useSendCustomerReplyMutation,
  useSendPublicReplyMutation,
} from "../../features/messages/messagesApi";

type Props = {
  inquiryId: string;
  viewer: "CUSTOMER" | "EMPLOYEE";
  replyToMessageId?: string | null;
  onSent?: () => void;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function PublicReplyForm({
  inquiryId,
  viewer,
  replyToMessageId,
  onSent,
}: Props) {
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  const [sendCustomerReply, customerRequest] = useSendCustomerReplyMutation();
  const [sendEmployeeReply, employeeRequest] = useSendPublicReplyMutation();

  const isSending = customerRequest.isLoading || employeeRequest.isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const text = body.trim();

    if (!text || isSending) return;

    setErrorMessage("");
    setSent(false);

    const selectedFile = new FormData(form).get("attachment");
    let attachment: File | undefined;

    if (selectedFile instanceof File && selectedFile.name) {
      if (selectedFile.size === 0) {
        setErrorMessage("The selected file is empty. Choose another file.");
        return;
      }

      if (selectedFile.size > MAX_FILE_BYTES) {
        setErrorMessage("Choose a file that is 5 MiB or smaller.");
        return;
      }

      attachment = selectedFile;
    }

    const input = {
      inquiryId,
      body: text,
      replyToMessageId,
      attachment,
    };

    try {
      if (viewer === "CUSTOMER") {
        await sendCustomerReply(input).unwrap();
      } else {
        await sendEmployeeReply(input).unwrap();
      }
    } catch (error) {
      const apiError = error as { data?: { message?: string } };
      setErrorMessage(
        apiError?.data?.message ||
          "Could not send your reply. Please try again.",
      );
      return;
    }

    form.reset();
    setBody("");
    setSent(true);
    onSent?.();
  };

  return (
    <form
      className="space-y-3 border-t pt-4"
      onSubmit={handleSubmit}
      onChange={() => {
        setSent(false);
        setErrorMessage("");
      }}
    >
      <label className="block font-medium">
        {replyToMessageId ? "Reply to this message" : "Public reply"}
        <textarea
          className="mt-1 block w-full rounded border p-2"
          rows={4}
          maxLength={5000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isSending}
          required
        />
      </label>

      <label className="block">
        Attachment (optional)
        <input
          className="mt-1 block w-full text-sm"
          type="file"
          name="attachment"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          disabled={isSending}
        />
        <span className="mt-1 block text-sm text-slate-600">
          PDF, PNG, or JPEG · Up to 5 MiB
        </span>
      </label>

      <button
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={isSending || !body.trim()}
      >
        {isSending ? "Sending…" : "Send reply"}
      </button>

      {errorMessage && <p role="alert">{errorMessage}</p>}
      {sent && <p role="status">Reply sent.</p>}
    </form>
  );
}
