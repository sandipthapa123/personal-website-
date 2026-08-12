import React, { useId } from 'react';

export interface TableBlockProps {
  caption?: string;
  headers?: string[];
  rows: string[][];
  striped?: boolean;
  bordered?: boolean;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  caption,
  headers = [],
  rows = [],
  striped = true,
  bordered = true,
}) => {
  const captionId = useId();

  return (
    // A horizontally scrollable region must be keyboard reachable and named, or
    // keyboard-only users can never scroll it (WCAG 2.1.1). tabIndex={0} plus
    // role="region" + a label is the standard remedy for scrollable tables.
    <div
      role="region"
      aria-labelledby={caption ? captionId : undefined}
      aria-label={caption ? undefined : 'Data table'}
      tabIndex={0}
      className="my-2 overflow-x-auto rounded-2xl border border-ink-border shadow-sm shadow-black/10"
    >
      <table className="w-full border-collapse text-left text-xs text-ink-400 sm:text-sm">
        {caption && (
          <caption
            id={captionId}
            className="border-b border-ink-border bg-ink-elevated p-3 text-left text-xs font-semibold text-ink-100"
          >
            {caption}
          </caption>
        )}
        {headers.length > 0 && (
          <thead className="border-b border-ink-border bg-ink-elevated text-[11px] font-bold uppercase tracking-wider text-ink-100">
            <tr>
              {headers.map((h, i) => (
                <th key={i} scope="col" className="whitespace-nowrap px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-ink-border">
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`transition-colors hover:bg-gold/[0.06] ${
                striped && rIdx % 2 === 1 ? 'bg-ink-elevated/40' : 'bg-ink'
              }`}
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-4 py-3 align-top ${bordered ? 'border-r border-ink-border/50 last:border-0' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
