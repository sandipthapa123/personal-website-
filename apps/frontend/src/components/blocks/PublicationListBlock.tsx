import React from 'react';
import { DownloadIcon } from '../ui/Icon';
import { Badge, Card, EmptyState, Section, SectionHeading, slugifyId } from '../ui/primitives';

export interface PublicationListProps {
  heading?: string;
  items?: Array<{
    title: string;
    journal?: string;
    publisher?: string;
    authors?: string[];
    year?: number;
    doi?: string;
    pdfUrl?: string;
    citationApa?: string;
    citationMla?: string;
    type?: string;
    url?: string;
  }>;
}

export const PublicationListBlock: React.FC<PublicationListProps> = ({ heading, items = [] }) => {
  const headingId = heading ? slugifyId(heading, 'publications') : undefined;

  return (
    <Section labelledBy={headingId} className="space-y-7">
      {heading && <SectionHeading id={headingId} title={heading} />}

      {items.length === 0 ? (
        <EmptyState
          title="No publications listed yet"
          description="Journal articles, chapters and papers will be listed here with full citations."
          icon={<span className="text-lg">§</span>}
        />
      ) : (
        <ul className="m-0 list-none space-y-5 p-0">
          {items.map((pub, idx) => (
            <Card as="li" key={idx} className="edge-lit space-y-3">
              {(pub.journal || pub.publisher || pub.type || pub.year) && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {(pub.journal || pub.publisher) && (
                    <span className="text-xs font-bold uppercase tracking-wider text-successText">
                      {pub.journal || pub.publisher}
                      {pub.year ? ` · ${pub.year}` : ''}
                    </span>
                  )}
                  {pub.type && <Badge tone="success">{pub.type}</Badge>}
                </div>
              )}

              <h3 className="text-lg font-semibold leading-snug text-ink-100 text-pretty">
                {pub.url ? (
                  <a href={pub.url} className="rounded transition-colors hover:text-successText">
                    {pub.title}
                  </a>
                ) : (
                  pub.title
                )}
              </h3>

              {pub.authors && pub.authors.length > 0 && (
                <p className="text-xs text-ink-400">
                  <span className="font-semibold">Authors:</span> {pub.authors.join(', ')}
                </p>
              )}

              {pub.citationApa && (
                <p className="rounded-lg border border-ink-border bg-ink p-3 font-mono text-[11px] leading-relaxed text-ink-400">
                  <span className="font-sans font-bold uppercase tracking-wider">APA</span> {pub.citationApa}
                </p>
              )}

              {(pub.doi || pub.pdfUrl) && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                  {pub.doi && (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-semibold text-gold-text transition hover:brightness-110"
                    >
                      DOI: {pub.doi}
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                  {pub.pdfUrl && (
                    <a
                      href={pub.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-semibold text-errorText transition hover:brightness-110"
                    >
                      <DownloadIcon className="text-xs" aria-hidden="true" /> Download PDF
                      <span className="sr-only">(PDF, opens in a new tab)</span>
                    </a>
                  )}
                </div>
              )}
            </Card>
          ))}
        </ul>
      )}
    </Section>
  );
};
