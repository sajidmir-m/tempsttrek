import { cn, crmTableHeader, crmTableRow } from './crm-variants';

export function CrmTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200', className)}>
      <table className="min-w-full divide-y divide-slate-100 text-sm">{children}</table>
    </div>
  );
}

export function CrmThead({ children }: { children: React.ReactNode }) {
  return <thead className={crmTableHeader}>{children}</thead>;
}

export function CrmTbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function CrmTr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn(crmTableRow, className)}>{children}</tr>;
}

export function CrmTh({ children, className, scope = 'col' }: { children: React.ReactNode; className?: string; scope?: 'col' | 'row' }) {
  return (
    <th scope={scope} className={cn('px-4 py-3', className)}>
      {children}
    </th>
  );
}

export function CrmTd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-slate-700', className)}>{children}</td>;
}
