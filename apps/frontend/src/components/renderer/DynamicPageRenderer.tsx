import React from 'react';
import { IPageRenderSchema } from '@cms/shared-types';
import { LayoutRegionKeys } from '@cms/constants';
import { renderBlockComponent } from '../blocks/BlockRegistry';

export interface DynamicPageRendererProps {
  schema: IPageRenderSchema;
}

export const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ schema }) => {
  const regions = schema?.layout?.regions || {};

  const headerBlocks = regions[LayoutRegionKeys.HEADER] || [];
  const mainBlocks = regions[LayoutRegionKeys.MAIN] || [];
  const footerBlocks = regions[LayoutRegionKeys.FOOTER] || [];

  return (
    <div className="min-h-screen flex flex-col bg-ink text-ink-100 overflow-x-hidden">
      {/* Header Region */}
      {headerBlocks.length > 0 && (
        <div className="border-b border-ink-border w-full">
          {headerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `header-${b.blockId}-${idx}`))}
        </div>
      )}

      {/* Main Region */}
      <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {mainBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `main-${b.blockId}-${idx}`))}
      </div>

      {/* Footer Region */}
      {footerBlocks.length > 0 ? (
        <div className="border-t border-ink-border py-6 text-center text-sm text-ink-400 w-full">
          {footerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `footer-${b.blockId}-${idx}`))}
        </div>
      ) : (
        <div className="border-t border-ink-border py-8 text-center text-sm text-ink-400 w-full">
          <p>© {new Date().getFullYear()} Sandip Thapa. Enterprise Platform-Driven CMS.</p>
        </div>
      )}
    </div>
  );
};
