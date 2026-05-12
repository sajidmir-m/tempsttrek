import { cn, crmCard, crmCardHeader } from './crm-variants';

export default function CrmCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        crmCard,
        'overflow-hidden transition-shadow duration-200 hover:shadow-md hover:shadow-slate-300/40',
        className
      )}
    >
      <div className={crmCardHeader}>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {icon ? <span className="text-teal-600 shrink-0">{icon}</span> : null}
            <span className="truncate">{title}</span>
          </p>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
