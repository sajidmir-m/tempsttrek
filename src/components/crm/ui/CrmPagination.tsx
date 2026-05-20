'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import CrmButton from './CrmButton';

export default function CrmPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  if (total <= pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <CrmButton variant="secondary" size="sm" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
          <ChevronLeft size={16} />
          Prev
        </CrmButton>
        <span className="px-2 font-medium text-slate-800">
          {safePage} / {totalPages}
        </span>
        <CrmButton
          variant="secondary"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
          <ChevronRight size={16} />
        </CrmButton>
      </div>
    </div>
  );
}
