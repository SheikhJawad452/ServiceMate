export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(page, totalPages));
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage <= 1}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {pages.map((pageNo) => (
        <button
          key={pageNo}
          type="button"
          onClick={() => onPageChange(pageNo)}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${
            pageNo === safePage
              ? "border-primary bg-primary text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {pageNo}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage >= totalPages}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
