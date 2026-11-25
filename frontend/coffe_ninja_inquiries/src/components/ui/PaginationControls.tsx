type Props = {
  page: number;
  hasNextPage: boolean;
  isFetching: boolean;
  onPageChange: (nextPage: number) => void;
};

export default function PaginationControls({
  page,
  hasNextPage,
  isFetching,
  onPageChange,
}: Props) {
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-2 pt-1 sm:gap-3 sm:pt-2"
    >
      <button
        type="button"
        className="cf-btn-secondary px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
        disabled={page <= 1 || isFetching}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Previous
      </button>

      <span className="text-xs text-[#BCD0C4] sm:text-sm">Page {page}</span>

      <button
        type="button"
        className="cf-btn-secondary px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
        disabled={!hasNextPage || isFetching}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
