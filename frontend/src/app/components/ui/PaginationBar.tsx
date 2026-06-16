import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_LIMIT_OPTIONS = [5, 10, 20, 50];

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  className = '',
}: PaginationBarProps) {
  const start = total > 0 ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{total > 0 ? `${start}–${end} / ${total}` : '0 natija'}</span>
        {onLimitChange && (
          <select
            value={limit}
            onChange={e => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {limitOptions.map(size => (
              <option key={size} value={size}>{size} ta</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-blue-600 text-white' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
