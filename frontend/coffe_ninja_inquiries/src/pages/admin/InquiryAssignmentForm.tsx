import { useState } from "react";
import type { FormEvent } from "react";

import {
  inquiryPriorities,
  useAssignInquiryMutation,
} from "../../features/inquiries/inquiriesApi";
import type { InquiryAssignment } from "../../features/inquiries/inquiriesApi";

type AssignableEmployee = {
  id: string;
  fullName: string;
};

type Props = {
  inquiry: InquiryAssignment;
  employees: AssignableEmployee[];
  onRefresh: () => void;
};

export default function InquiryAssignmentForm({
  inquiry,
  employees,
  onRefresh,
}: Props) {
  const [employeeId, setEmployeeId] = useState(
    inquiry.assignedEmployeeId ?? "",
  );
  const [priority, setPriority] = useState(inquiry.priority);
  const [message, setMessage] = useState("");
  const [hasConflict, setHasConflict] = useState(false);
  const [assignInquiry, { isLoading }] = useAssignInquiryMutation();

  const canAssign =
    inquiry.status !== "RESOLVED" && inquiry.status !== "CLOSED";
  const hasSelectedEmployee = employees.some(
    (employee) => employee.id === employeeId,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canAssign || !hasSelectedEmployee || hasConflict || isLoading) {
      return;
    }

    setMessage("");

    try {
      await assignInquiry({
        inquiryId: inquiry.id,
        employeeId,
        priority,
        version: inquiry.version,
      }).unwrap();

      setMessage("Assignment saved.");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 409
      ) {
        setHasConflict(true);
        setMessage("Refresh the inquiry and review it before assigning again.");
        return;
      }

      setMessage(
        "Could not save the assignment. Check the employee and try again.",
      );
    }
  };

  if (!canAssign) {
    return <p>Only open inquiries can be assigned.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <fieldset className="space-y-4" disabled={isLoading || hasConflict}>
        <label className="block">
          Employee
          <select
            className="mt-1 block w-full rounded border p-2"
            value={hasSelectedEmployee ? employeeId : ""}
            onChange={(event) => setEmployeeId(event.target.value)}
            required
          >
            <option value="">Select an active employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          Priority
          <select
            className="mt-1 block w-full rounded border p-2"
            value={priority}
            onChange={(event) => {
              const selected = inquiryPriorities.find(
                (value) => value === event.target.value,
              );
              if (selected) setPriority(selected);
            }}
          >
            {inquiryPriorities.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <button
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          disabled={!hasSelectedEmployee}
        >
          {isLoading
            ? "Saving…"
            : inquiry.assignedEmployeeId
              ? "Save assignment"
              : "Assign inquiry"}
        </button>
      </fieldset>

      {message && <p role="status">{message}</p>}

      {hasConflict && (
        <button className="underline" type="button" onClick={onRefresh}>
          Refresh inquiry
        </button>
      )}
    </form>
  );
}
