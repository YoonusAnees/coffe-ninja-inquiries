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
      className="space-y-3 border-t border-[#315747] pt-4"
      onSubmit={handleSubmit}
      onChange={() => {
        setSent(false);
        setErrorMessage("");
      }}
    >
      <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
        <span>{replyToMessageId ? "Reply to this message" : "Public reply"}</span>
        <textarea
          className="cf-input"
          rows={4}
          maxLength={5000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isSending}
          required
        />
      </label>

      <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
        <span>Attachment (optional)</span>
        <input
          className="block w-full text-sm text-[#BCD0C4] file:mr-3 file:rounded-lg file:border file:border-[#315747] file:bg-[#0B241B] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#F5FAF7] hover:file:bg-[#143D2E]"
          type="file"
          name="attachment"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          disabled={isSending}
        />
        <span className="block text-xs text-[#BCD0C4]">
          PDF, PNG, or JPEG · Up to 5 MiB
        </span>
      </label>

      <button
        className="cf-btn-primary"
        type="submit"
        disabled={isSending || !body.trim()}
      >
        {isSending ? "Sending…" : "Send reply"}
      </button>

      {errorMessage && (
        <p role="alert" className="text-sm text-rose-300">
          {errorMessage}
        </p>
      )}
      {sent && (
        <p role="status" className="text-sm text-[#6EE7A5]">
          Reply sent.
        </p>
      )}
    </form>
  );
}
