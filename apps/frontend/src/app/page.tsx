import React from 'react';
import type { Metadata } from 'next';
import { DynamicPageRenderer } from '../components/renderer/DynamicPageRenderer';

import { cache } from 'react';

const getBackendRenderSchema = cache(async () => {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
    const res = await fetch(`${apiBase}/renderer/page?slug=/`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const schema = await getBackendRenderSchema();
  const seo = (schema?.seo || {}) as Record<string, any>;

  return {
    title: seo.metaTitle || 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
    description:
      seo.metaDescription ||
      'Personal CMS Platform of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
    alternates: {
      canonical: seo.canonicalUrl || 'https://thapasandip.com.np',
    },
    openGraph: {
      title: seo.metaTitle || 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
      description:
        seo.metaDescription ||
        'Personal CMS Platform of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
      url: seo.canonicalUrl || 'https://thapasandip.com.np',
      type: 'website',
    },
  };
}

export default async function HomePage() {
  const schema = await getBackendRenderSchema();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sandip Thapa',
    jobTitle: 'Legal Scholar & Disability Rights Researcher',
    url: 'https://thapasandip.com.np',
    sameAs: [
      'https://orcid.org/0000-0002-1234-5678',
      'https://scholar.google.com',
      'https://linkedin.com',
    ],
    knowsAbout: [
      'Disability Rights Law',
      'UN CRPD Article 12 Legal Capacity',
      'Nepalese Jurisprudence',
      'Digital Accessibility Compliance (WCAG 2.2 AAA)',
      'Literary Translation',
    ],
  };

  if (!schema) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-white">Sandip Thapa Knowledge Engine</h1>
        <p className="text-slate-400">Loading backend render schema...</p>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DynamicPageRenderer schema={schema} />
    </>
  );
}
