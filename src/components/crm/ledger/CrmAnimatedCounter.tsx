'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export default function CrmAnimatedCounter({
  value,
  prefix = '',
  className,
  duration = 600,
}: {
  value: number;
  prefix?: string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const end = Number(value) || 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last rendered value
  }, [value, duration]);

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {display.toLocaleString('en-IN')}
    </span>
  );
}
