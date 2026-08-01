import React from 'react';
import { IPageRenderSchema } from '@cms/shared-types';
import { LayoutRegionKeys } from '@cms/constants';
import { renderBlockComponent } from '../blocks/BlockRegistry';

export interface DynamicPageRendererProps {
  schema: IPageRenderSchema;
}

export const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ schema }) => {
  const { regions } = schema.layout;

  const headerBlocks = regions[LayoutRegionKeys.HEADER] || [];
  const mainBlocks = regions[LayoutRegionKeys.MAIN] || [];
  const footerBlocks = regions[LayoutRegionKeys.FOOTER] || [];

  return (
    <div className="min-h-screen flex flex-col bg-surface text-bodyText">
      {/* Header Region */}
      {headerBlocks.length > 0 && (
        <header className="border-b border-slate-200 dark:border-slate-800">
          {headerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `header-${b.blockId}-${idx}`))}
        </header>
      )}

      {/* Main Region */}
      <main className="flex-grow">
        {mainBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `main-${b.blockId}-${idx}`))}
      </main>

      {/* Footer Region */}
      {footerBlocks.length > 0 ? (
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500">
          {footerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `footer-${b.blockId}-${idx}`))}
        </footer>
      ) : (
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Sandip Thapa. Enterprise Platform-Driven CMS.</p>
        </footer>
      )}
    </div>
  );
};
