import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CmsApiClient } from '@cms/api-client';
import { DynamicPageRenderer } from '../../components/renderer/DynamicPageRenderer';
import { EmptyPagePlaceholder } from '../../components/content/EmptyPagePlaceholder';

interface DynamicPageProps {
  params: {
    slug: string[];
  };
}

async function fetchPageSchema(slugArray: string[]) {
  const pageSlug = slugArray?.join('/') || 'home';
  const apiClient = new CmsApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  });

  try {
    const renderResponse = await apiClient.getRenderPage(pageSlug);
    return { pageSlug, data: renderResponse.data };
  } catch (err) {
    return { pageSlug, data: null };
  }
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  if (params.slug?.includes('admin')) {
    return { title: '404: Page Not Found' };
  }

  const { pageSlug, data } = await fetchPageSchema(params.slug);
  const rawData = (data || {}) as Record<string, any>;
  const seo = (rawData?.seo || {}) as Record<string, any>;
  const pageTitle = rawData?.title || rawData?.page?.title || pageSlug.replace(/-/g, ' ').toUpperCase();

  return {
    title: seo.metaTitle || `${pageTitle} | Sandip Thapa`,
    description: seo.metaDescription || `Explore ${pageTitle} on the personal academic CMS platform of Sandip Thapa.`,
    alternates: {
      canonical: seo.canonicalUrl || `https://thapasandip.com.np/${pageSlug}`,
    },
    openGraph: {
      title: seo.metaTitle || `${pageTitle} | Sandip Thapa`,
      description: seo.metaDescription,
      url: seo.canonicalUrl || `https://thapasandip.com.np/${pageSlug}`,
    },
  };
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  if (params.slug?.includes('admin')) {
    notFound();
  }

  const { pageSlug, data } = await fetchPageSchema(params.slug);
  const rawData = (data || {}) as Record<string, any>;

  // If backend returns status === 'EMPTY' or published === false, render WCAG 2.2 AAA Empty Placeholder
  if (rawData?.status === 'EMPTY' || rawData?.published === false || rawData?.page?.status === 'EMPTY') {
    return (
      <EmptyPagePlaceholder
        title={rawData.title || rawData.page?.title || pageSlug}
        slug={pageSlug}
        message={rawData.message}
      />
    );
  }

  if (data) {
    return <DynamicPageRenderer schema={data} />;
  }

  // Fallback for valid CMS pages when backend payload has no content items
  return (
    <EmptyPagePlaceholder
      title={pageSlug.replace(/-/g, ' ').toUpperCase()}
      slug={pageSlug}
      message="There is currently no published content available for this page. Content will appear here once it has been reviewed and published."
    />
  );
}
