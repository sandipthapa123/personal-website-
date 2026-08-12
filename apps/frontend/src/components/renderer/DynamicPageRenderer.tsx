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

  const hasSidebar = sidebarBlocks.length > 0;

  return (
    // No `min-h-screen` here: this renders *inside* the app-level <main>, which
    // already sits between the sticky header and the site footer. Forcing a full
    // viewport height on top of those pushed the real footer off-screen.
    <div className="w-full">
      {headerBlocks.length > 0 && (
        <div className="w-full border-b border-ink-border">
          {headerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `header-${b.blockId}-${idx}`))}
        </div>
      )}

      <div
        className={`mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 ${
          hasSidebar ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12' : ''
        }`}
      >
        {/* `section-flow` supplies the consistent vertical rhythm between blocks
            so individual blocks no longer carry their own outer margins. */}
        <div className="section-flow min-w-0">
          {mainBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `main-${b.blockId}-${idx}`))}
        </div>

        {hasSidebar && (
          <aside
            aria-label="Supplementary information"
            className="mt-12 space-y-6 lg:sticky lg:top-24 lg:mt-0"
          >
            {sidebarBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `sidebar-${b.blockId}-${idx}`))}
          </aside>
        )}
      </div>

      {/* Only render a page-level footer region when the CMS actually supplies
          one. The unconditional copyright line that used to live here duplicated
          the site footer, so every page showed two copyright notices. */}
      {footerBlocks.length > 0 && (
        <div className="w-full border-t border-ink-border py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {footerBlocks.map((b, idx) => renderBlockComponent(b.type, b.props, `footer-${b.blockId}-${idx}`))}
          </div>
        </div>
      )}
    </div>
  );
};
