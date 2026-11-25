import { useState, type FormEvent } from "react";

import {
  inquiryPriorities,
  useAssignInquiryMutation,
  type InquiryAssignment,
} from "../../features/inquiries/inquiriesApi";

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
    return (
      <p className="text-sm text-[#BCD0C4]">
        Only open inquiries can be assigned.
      </p>
    );
  }

  return (
    <form className="space-y-4 border-t border-[#315747] pt-4" onSubmit={handleSubmit}>
      <fieldset className="space-y-4" disabled={isLoading || hasConflict}>
        <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
          <span>Employee</span>
          <select
            className="cf-input"
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

        <label className="block space-y-1 text-sm font-medium text-[#BCD0C4]">
          <span>Priority</span>
          <select
            className="cf-input"
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
          className="cf-btn-primary"
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

      {message && (
        <p role="status" className="text-sm text-[#6EE7A5]">
          {message}
        </p>
      )}

      {hasConflict && (
        <button
          className="cf-btn-secondary"
          type="button"
          onClick={onRefresh}
        >
          Refresh inquiry
        </button>
      )}
    </form>
  );
}
