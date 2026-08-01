import React from 'react';
import { CmsApiClient } from '@cms/api-client';
import { DynamicPageRenderer } from '../../components/renderer/DynamicPageRenderer';

interface DynamicPageProps {
  params: {
    slug: string[];
  };
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const pageSlug = params.slug?.join('/') || 'home';
  const apiClient = new CmsApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  });

  try {
    const renderResponse = await apiClient.getRenderPage(pageSlug);
    return <DynamicPageRenderer schema={renderResponse.data} />;
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50 text-slate-900">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold text-sky-600">Backend Dynamic Page Renderer</h1>
          <p className="text-slate-600">Rendering backend layout contract for slug: <code>{pageSlug}</code></p>
          <a href="/" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-md">Return to Home</a>
        </div>
      </div>
    );
  }
}
