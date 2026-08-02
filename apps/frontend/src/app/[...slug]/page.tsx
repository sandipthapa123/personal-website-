import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CmsApiClient } from '@cms/api-client';
import { DynamicPageRenderer } from '../../components/renderer/DynamicPageRenderer';

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
  const seo = (data?.seo || {}) as Record<string, any>;
  const pageTitle = data?.page?.title || pageSlug.replace(/-/g, ' ').toUpperCase();

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

  if (data) {
    return <DynamicPageRenderer schema={data} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-950 text-slate-100">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-sky-500">Backend Dynamic Page Renderer</h1>
        <p className="text-slate-400">Rendering backend layout contract for slug: <code>{pageSlug}</code></p>
        <a href="/" className="inline-block px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
}
