import { useState, type FormEvent } from "react";
import { ThreadSkeleton } from "../../components/ui/LoadingState";

import {
  useAddEmployeeNoteMutation,
  useGetEmployeeNotesQuery,
} from "../../features/messages/messagesApi";

type Props = {
  inquiryId: string;
  currentUserId: string;
  canAddNote: boolean;
};

export default function EmployeeNotes({
  inquiryId,
  currentUserId,
  canAddNote,
}: Props) {
  const [body, setBody] = useState("");

  const {
    currentData: notes = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetEmployeeNotesQuery(inquiryId, {
    refetchOnMountOrArgChange: true,
  });

  const [addNote, saveNote] = useAddEmployeeNoteMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = body.trim();
    if (!text || !canAddNote || saveNote.isLoading) return;

    const result = await addNote({ inquiryId, body: text });

    if ("data" in result) {
      setBody("");
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-amber-400/40 bg-amber-950/25 p-4">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#F5FAF7]">
            Internal notes
          </h2>
          <span className="rounded-full border border-amber-400/45 bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-200">
            Private to staff
          </span>
        </div>
        <p className="text-sm text-[#BCD0C4]">
          Not visible to the customer. The next assigned employee can read these
          notes.
        </p>
      </header>

      {isLoading && <ThreadSkeleton />}

      {isError && (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-rose-200">
            Could not load internal notes.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {notes.length === 0 ? (
            <p className="text-sm text-[#BCD0C4]">No internal notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="space-y-1 rounded-lg border border-amber-400/30 bg-[#0B241B] p-3"
                >
                  <p className="text-xs font-semibold text-amber-200">
                    {note.authorId === currentUserId ? "You" : "Employee"}
                  </p>

                  <p className="whitespace-pre-wrap break-words text-sm text-[#F5FAF7]">
                    {note.body}
                  </p>

                  <time
                    className="block text-xs text-[#BCD0C4]"
                    dateTime={note.createdAt}
                  >
                    {new Date(note.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}

          {canAddNote && (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
                <span>New internal note</span>
                <textarea
                  className="cf-input"
                  rows={3}
                  maxLength={50000}
                  value={body}
                  required
                  disabled={saveNote.isLoading}
                  onChange={(event) => {
                    setBody(event.target.value);
                    if (saveNote.isSuccess || saveNote.isError) {
                      saveNote.reset();
                    }
                  }}
                />
              </label>

              <button
                type="submit"
                className="cf-btn-primary"
                disabled={saveNote.isLoading || !body.trim()}
              >
                {saveNote.isLoading ? "Saving…" : "Add internal note"}
              </button>

              {saveNote.isSuccess && (
                <p role="status" className="text-sm text-[#6EE7A5]">
                  Internal note added.
                </p>
              )}

              {saveNote.isError && (
                <p role="alert" className="text-sm text-rose-300">
                  Could not save the note. Your draft is still here.
                </p>
              )}
            </form>
          )}
        </>
      )}
    </section>
  );
}
