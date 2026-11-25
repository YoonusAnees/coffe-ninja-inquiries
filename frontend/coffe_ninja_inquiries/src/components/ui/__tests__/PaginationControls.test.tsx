import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PaginationControls from "../PaginationControls";

describe("PaginationControls", () => {
  it("disables Previous on page 1 and triggers Next when hasNextPage is true", () => {
    const onPageChange = vi.fn();

    render(
      <PaginationControls
        page={1}
        hasNextPage={true}
        isFetching={false}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeEnabled();
    expect(screen.getByText("Page 1")).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("navigates backward on Previous click and disables both buttons while fetching", () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <PaginationControls
        page={3}
        hasNextPage={false}
        isFetching={false}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeDisabled();

    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <PaginationControls
        page={3}
        hasNextPage={true}
        isFetching={true}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});

