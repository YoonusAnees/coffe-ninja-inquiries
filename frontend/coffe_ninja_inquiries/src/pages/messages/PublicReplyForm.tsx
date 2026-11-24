import { useState } from "react";
import type { FormEvent } from "react";
import { useSendPublicReplyMutation } from "../../features/messages/messagesApi";

type Props = {
  inquiryId: string;
};

export default function PublicReplyForm({ inquiryId }: Props) {
  const [body, setBody] = useState("");
  const [sendReply, { isLoading, isError, isSuccess, reset }] =
    useSendPublicReplyMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = body.trim();
    if (!text || isLoading) return;

    try {
      await sendReply({ inquiryId, body: text }).unwrap();
      setBody("");
    } catch {
      // Keep the draft and display the mutation error below.
    }
  };

  return (
    <form className="space-y-3 border-t pt-4" onSubmit={handleSubmit}>
      <label className="block font-medium">
        Public reply
        <textarea
          className="mt-1 block w-full rounded border p-2"
          rows={4}
          maxLength={5000}
          value={body}
          disabled={isLoading}
          onChange={(event) => {
            setBody(event.target.value);
            if (isSuccess || isError) reset();
          }}
          required
        />
      </label>

      <p className="text-sm text-slate-600">
        The customer can read this reply.
      </p>

      <button
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={isLoading || !body.trim()}
      >
        {isLoading ? "Sending…" : "Send reply"}
      </button>

      {isSuccess && <p role="status">Reply sent.</p>}
      {isError && (
        <p role="alert">Could not send the reply. Your draft is still here.</p>
      )}
    </form>
  );
}
