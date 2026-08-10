import React from 'react';

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
}) => (
  <div className="my-6 overflow-x-auto rounded-xl border border-ink-border shadow-md shadow-black/20">
    <table className="w-full text-left text-xs sm:text-sm text-ink-400">
      {caption && (
        <caption className="p-3 text-xs font-semibold text-ink-400 bg-ink-elevated border-b border-ink-border text-left">
          {caption}
        </caption>
      )}
      {headers.length > 0 && (
        <thead className="bg-ink-elevated text-ink-100 font-bold uppercase text-[11px] tracking-wider border-b border-ink-border">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3">
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
            className={striped && rIdx % 2 === 1 ? 'bg-ink-elevated/40' : 'bg-ink'}
          >
            {row.map((cell, cIdx) => (
              <td key={cIdx} className={`px-4 py-3 ${bordered ? 'border-r border-ink-border/50 last:border-0' : ''}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
