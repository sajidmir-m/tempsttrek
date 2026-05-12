import { memo } from 'react';
import CrmBadge, { arrivalStatusTone, followupStatusTone } from '../ui/CrmBadge';

type Props = {
  primary: string;
  secondary?: string;
  status?: string | null;
  statusKind?: 'arrival' | 'followup';
};

function CrmDataRowInner({ primary, secondary, status, statusKind = 'arrival' }: Props) {
  const tone = statusKind === 'followup' ? followupStatusTone(status) : arrivalStatusTone(status);
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{primary}</p>
        {secondary ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{secondary}</p> : null}
      </div>
      {status ? (
        <CrmBadge tone={tone} className="shrink-0">
          {(status || '—').toUpperCase()}
        </CrmBadge>
      ) : null}
    </div>
  );
}

export default memo(CrmDataRowInner);
