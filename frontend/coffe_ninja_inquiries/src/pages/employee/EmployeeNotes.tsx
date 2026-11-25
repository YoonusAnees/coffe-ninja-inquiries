import { useState, type FormEvent } from "react";

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
    <section className="space-y-4 rounded border border-amber-200 bg-amber-50 p-4">
      <header>
        <h2 className="text-lg font-semibold">Internal notes</h2>
        <p className="text-sm text-slate-700">
          Private to staff. The next assigned employee can read these notes.
        </p>
      </header>

      {isLoading && <p role="status">Loading internal notes…</p>}

      {isError && (
        <div>
          <p role="alert">Could not load internal notes.</p>
          <button
            type="button"
            className="underline"
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
            <p className="text-sm text-slate-700">No internal notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.id} className="rounded border bg-white p-3">
                  <p className="text-sm font-semibold">
                    {note.authorId === currentUserId ? "You" : "Employee"}
                  </p>

                  <p className="whitespace-pre-wrap">{note.body}</p>

                  <time
                    className="text-xs text-slate-600"
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
              <label className="block font-medium">
                New internal note
                <textarea
                  className="mt-1 block w-full rounded border bg-white p-2"
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
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
                disabled={saveNote.isLoading || !body.trim()}
              >
                {saveNote.isLoading ? "Saving…" : "Add internal note"}
              </button>

              {saveNote.isSuccess && <p role="status">Internal note added.</p>}

              {saveNote.isError && (
                <p role="alert">
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
