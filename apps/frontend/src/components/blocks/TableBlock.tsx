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
  <div className="my-6 overflow-x-auto rounded-xl border border-slate-800 shadow-md">
    <table className="w-full text-left text-xs sm:text-sm text-slate-300">
      {caption && (
        <caption className="p-3 text-xs font-semibold text-slate-400 bg-slate-900 border-b border-slate-800 text-left">
          {caption}
        </caption>
      )}
      {headers.length > 0 && (
        <thead className="bg-slate-900 text-slate-100 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-slate-800">
        {rows.map((row, rIdx) => (
          <tr
            key={rIdx}
            className={striped && rIdx % 2 === 1 ? 'bg-slate-900/40' : 'bg-slate-950'}
          >
            {row.map((cell, cIdx) => (
              <td key={cIdx} className={`px-4 py-3 ${bordered ? 'border-r border-slate-800/50 last:border-0' : ''}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
