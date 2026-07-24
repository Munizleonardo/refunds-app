interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizes: readonly number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizes,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted">
        {totalItems === 0
          ? "Nenhum resultado"
          : `Mostrando ${start}–${end} de ${totalItems}`}
      </span>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <label className="flex items-center gap-2 text-sm text-muted">
          Por página
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="cursor-pointer rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-muted text-foreground hover:bg-accent-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹
          </button>
          <span className="text-sm text-muted whitespace-nowrap">
            Página {page} de {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Próxima página"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-muted text-foreground hover:bg-accent-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
