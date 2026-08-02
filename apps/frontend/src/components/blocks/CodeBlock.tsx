import React from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  caption?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript', caption }) => (
  <div className="my-6 space-y-2">
    {caption && <div className="text-xs font-mono text-slate-400 font-semibold px-2">{caption}</div>}
    <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>{language}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(code)}
          className="hover:text-sky-400 transition-colors"
          aria-label="Copy code"
        >
          📋 Copy
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);
