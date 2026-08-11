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
  const sidebarBlocks = regions[LayoutRegionKeys.SIDEBAR] || [];
  const footerBlocks = regions[LayoutRegionKeys.FOOTER] || [];

  return (
    <div className="min-h-screen flex flex-col bg-ink text-ink-100 overflow-x-hidden">
      {/* Header Region */}
      {headerBlocks.length > 0 && (
        <div className="border-b border-ink-border w-full">
          {headerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `header-${b.blockId}-${idx}`))}
        </div>
      )}

      {/* Main + Sidebar Regions */}
      <div
        className={`flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 ${
          sidebarBlocks.length > 0 ? 'grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start' : ''
        }`}
      >
        <div className="space-y-16 min-w-0">
          {mainBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `main-${b.blockId}-${idx}`))}
        </div>

        {sidebarBlocks.length > 0 && (
          <aside className="space-y-6 lg:sticky lg:top-24">
            {sidebarBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `sidebar-${b.blockId}-${idx}`))}
          </aside>
        )}
      </div>

      {/* Footer Region */}
      {footerBlocks.length > 0 ? (
        <div className="border-t border-ink-border py-6 text-center text-sm text-ink-400 w-full">
          {footerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `footer-${b.blockId}-${idx}`))}
        </div>
      ) : (
        <div className="border-t border-ink-border py-8 text-center text-sm text-ink-400 w-full">
          <p>© {new Date().getFullYear()} Sandip Thapa. All rights reserved.</p>
        </div>
      )}
    </div>
  );
};
