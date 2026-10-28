'use client';

import { ui } from '@/lib/ui';
import { cloneElement, useEffect, useId, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

/** Portaled so hover hints remain visible outside the scrolling table. */
export function RecordTooltip({
  text,
  children,
}: {
  text: string;
  children: ReactElement<{ 'aria-describedby'?: string }>;
}) {
  const id = useId();
  const [position, setPosition] = useState<{ x: number; y: number; above: boolean } | null>(null);
  useEffect(() => {
    if (!position) return;
    const dismiss = () => setPosition(null);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('keydown', key);
    };
  }, [position]);
  return (
    <span
      className={ui('record-tooltip-anchor')}
      onMouseEnter={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        setPosition({
          x: Math.max(130, Math.min(window.innerWidth - 130, box.left + box.width / 2)),
          y: box.top > 70 ? box.top - 8 : box.bottom + 8,
          above: box.top > 70,
        });
      }}
      onFocus={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        setPosition({
          x: Math.max(130, Math.min(window.innerWidth - 130, box.left + box.width / 2)),
          y: box.top > 70 ? box.top - 8 : box.bottom + 8,
          above: box.top > 70,
        });
      }}
      onMouseLeave={() => setPosition(null)}
      onBlur={() => setPosition(null)}
      onClick={() => setPosition(null)}
    >
      {cloneElement(children, { 'aria-describedby': position ? id : undefined })}
      {position &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className={ui(`record-tooltip ${position.above ? 'above' : ''}`)}
            style={{ left: position.x, top: position.y }}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
