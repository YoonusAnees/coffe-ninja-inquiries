import { useState, type FormEvent } from "react";
import {
  useSendCustomerReplyMutation,
  useSendPublicReplyMutation,
} from "../../features/messages/messagesApi";

type Props = {
  inquiryId: string;
  viewer: "CUSTOMER" | "EMPLOYEE";
  replyToMessageId?: string;
};

export default function PublicReplyForm({
  inquiryId,
  viewer,
  replyToMessageId,
}: Props) {
  const [body, setBody] = useState("");

  const [sendCustomerReply, customerRequest] = useSendCustomerReplyMutation();
  const [sendEmployeeReply, employeeRequest] = useSendPublicReplyMutation();

  const isCustomer = viewer === "CUSTOMER";
  const request = isCustomer ? customerRequest : employeeRequest;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = body.trim();
    if (!text || request.isLoading) return;

    try {
      if (isCustomer) {
        await sendCustomerReply({
          inquiryId,
          body: text,
          replyToMessageId,
        }).unwrap();
      } else {
        await sendEmployeeReply({ inquiryId, body: text }).unwrap();
      }

      setBody("");
    } catch {
      // The error is displayed below. Keep the draft so the user can retry.
    }
  };

  return (
    <form className="space-y-3 border-t pt-3" onSubmit={handleSubmit}>
      <label className="block font-medium">
        {replyToMessageId ? "Your reply to this message" : "Public message"}
        <textarea
          className="mt-1 block w-full rounded border p-2"
          rows={3}
          maxLength={5000}
          value={body}
          required
          disabled={request.isLoading}
          onChange={(event) => {
            setBody(event.target.value);
            if (request.isError || request.isSuccess) request.reset();
          }}
        />
      </label>

      <button
        type="submit"
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        disabled={request.isLoading || !body.trim()}
      >
        {request.isLoading ? "Sending…" : "Send reply"}
      </button>

      {request.isSuccess && <p role="status">Reply sent.</p>}
      {request.isError && (
        <p role="alert">Could not send your reply. Your draft is still here.</p>
      )}
    </form>
  );
}
