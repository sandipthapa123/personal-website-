import React from 'react';
import { CopyIcon } from '../ui/Icon';

export interface CodeBlockProps {
  code: string;
  language?: string;
  caption?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript', caption }) => (
  <div className="my-6 space-y-2">
    {caption && <div className="text-xs font-mono text-ink-400 font-semibold px-2">{caption}</div>}
    <div className="relative bg-ink border border-ink-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-ink-elevated border-b border-ink-border flex items-center justify-between text-[11px] text-ink-400 font-mono">
        <span>{language}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(code)}
          className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
          aria-label="Copy code"
        >
          <CopyIcon className="text-xs" /> Copy
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono text-ink-100 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);
